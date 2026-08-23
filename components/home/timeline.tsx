import { MutableRefObject, useEffect, useRef, useState } from "react";
import {
  Branch,
  BranchNode,
  CheckpointNode,
  ItemSize,
  MENULINKS,
  NodeTypes,
  TIMELINE,
  TimelineNodeV2,
} from "../../constants";
import Image from "next/image";
import { gsap, Linear } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { IDesktop, isSmallScreen } from "pages";

const svgColor = "#9CA3AF";
const animColor = "#FCD34D";
const separation = 450;
const strokeWidth = 2;
const leftBranchX = 13;
const curveLength = 150;
const dotSize = 26;

const TimelineSection = ({ isDesktop }: IDesktop) => {
  const [svgWidth, setSvgWidth] = useState(400);
  const [rightBranchX, setRightBranchX] = useState(109);

  const svgCheckpointItems = TIMELINE.filter(
    (item) => item.type === NodeTypes.CHECKPOINT && item.shouldDrawLine
  );

  const getCheckpointSpacing = (node?: TimelineNodeV2): number =>
    node?.type === NodeTypes.CHECKPOINT
      ? node.spacing || separation
      : separation;

  const getTimelineSvgLength = (timeline: Array<TimelineNodeV2>): number => {
    let y = dotSize / 2;
    let finalContentBottom = y;

    timeline.forEach((timelineNode, index) => {
      const node = {
        ...timelineNode,
        next: timeline[index + 1],
        prev: timeline[index - 1],
      } as LinkedTimelineNode;

      if (node.type !== NodeTypes.CHECKPOINT) {
        return;
      }

      const nodeSpacing = getCheckpointSpacing(node);
      const dotY = node.shouldDrawLine ? y + nodeSpacing / 2 : y;
      const contentHeight =
        Math.max(220, node.spacing || separation) - 20;

      finalContentBottom = Math.max(
        finalContentBottom,
        dotY - dotSize / 2 + contentHeight
      );

      if (node.shouldDrawLine) {
        y += nodeSpacing;
      }

      if (
        node.size === ItemSize.LARGE &&
        node.next?.type === NodeTypes.CHECKPOINT &&
        node.next.size === ItemSize.LARGE
      ) {
        y += separation;
      }
    });

    return Math.ceil(Math.max(y, finalContentBottom) + dotSize);
  };

  const svgLength = getTimelineSvgLength(TIMELINE);

  const getSlideCheckpointPositions = (
    timeline: Array<TimelineNodeV2>
  ): number[] => {
    let y = dotSize / 2;
    const positions: number[] = [];

    addNodeRefsToItems(timeline).forEach((node) => {
      if (node.type !== NodeTypes.CHECKPOINT) {
        return;
      }

      const nodeSpacing = getCheckpointSpacing(node);
      let dotY = node.shouldDrawLine ? y + nodeSpacing / 2 : y;

      if (node.next?.type === NodeTypes.DIVERGE) {
        dotY = dotY - curveLength + 6 * dotSize;
      }

      if (node.next?.type === NodeTypes.CONVERGE) {
        dotY = dotY + curveLength - 6 * dotSize;
      }

      if (node.shouldDrawLine) {
        positions.push(dotY);
        y += nodeSpacing;
      }

      if (
        node.size === ItemSize.LARGE &&
        node.next?.type === NodeTypes.CHECKPOINT &&
        node.next.size === ItemSize.LARGE
      ) {
        y += separation;
      }
    });

    return positions;
  };

  const slideCheckpointPositions = getSlideCheckpointPositions(TIMELINE);
  const previewTravelDistance = Math.max(
    0,
    (slideCheckpointPositions[slideCheckpointPositions.length - 1] || 0) -
      (slideCheckpointPositions[0] || 0)
  );

  const animationSegmentCount = TIMELINE.reduce((total, item, index) => {
    const next = TIMELINE[index + 1];
    const isDrawnCheckpoint =
      item.type === NodeTypes.CHECKPOINT && item.shouldDrawLine;
    const isAdjacentYearConnector =
      item.type === NodeTypes.CHECKPOINT &&
      item.size === ItemSize.LARGE &&
      next?.type === NodeTypes.CHECKPOINT &&
      next.size === ItemSize.LARGE;

    return total + Number(isDrawnCheckpoint) + Number(isAdjacentYearConnector);
  }, 0);

  const timelineSvg: MutableRefObject<SVGSVGElement> = useRef(null);
  const svgContainer: MutableRefObject<HTMLDivElement> = useRef(null);
  const screenContainer: MutableRefObject<HTMLDivElement> = useRef(null);

  function addNodeRefsToItems(
    timeline: Array<TimelineNodeV2>
  ): Array<LinkedTimelineNode> {
    return timeline.map((node, idx) => ({
      ...node,
      next: timeline[idx + 1],
      prev: timeline[idx - 1],
    }));
  }

  const generateTimelineSvg = (timeline: Array<TimelineNodeV2>): string => {
    let index = 1;
    let y = dotSize / 2;
    const timelineStyle = `<style>.str, .dot{stroke-width: ${strokeWidth}px}.anim-branch{stroke-dasharray: 186}</style>`;
    let isDiverged = false;

    const timelineSvg = addNodeRefsToItems(timeline).reduce(
      (svg: string, node: LinkedTimelineNode) => {
        const { type, next } = node;
        const nodeSpacing = getCheckpointSpacing(node);
        let lineY = y;
        let dotY = y + nodeSpacing / 2;

        switch (type) {
          case NodeTypes.CHECKPOINT:
            {
              const { shouldDrawLine } = node;

              // Keep the final event connected to its preceding year marker.
              if (!next) {
                lineY = y;
              }

              // special handling for dot without line
              if (!shouldDrawLine) {
                dotY = y;
              }

              if (shouldDrawLine) {
                // TO DO fix syntax
                svg = shouldDrawLine
                  ? `${drawLine(
                      node,
                      lineY,
                      index,
                      isDiverged,
                      nodeSpacing
                    )}${svg}`
                  : svg;
                y = y + nodeSpacing;
                index++;
              }

              svg = svg.concat(drawDot(node, dotY, isDiverged));

              // Large year checkpoints do not normally advance the SVG cursor
              // because the following event supplies the vertical spacing.
              // When two year checkpoints are adjacent, however, both would be
              // rendered at the same y-coordinate. Advance once so each year
              // marker has its own position without changing timeline data.
              if (
                node.size === ItemSize.LARGE &&
                next?.type === NodeTypes.CHECKPOINT &&
                next.size === ItemSize.LARGE
              ) {
                svg = `${drawMainLineSegment(y, separation, index)}${svg}`;
                y += separation;
                index++;
              }
            }
            break;
          case NodeTypes.DIVERGE:
            {
              isDiverged = true;

              svg = `${drawBranch(
                node,
                y,
                index,
                getCheckpointSpacing(next)
              )}${svg}`;
            }
            break;
          case NodeTypes.CONVERGE:
            {
              isDiverged = false;

              // Drawing CONVERGE branch with previous line and index
              const previousSpacing = getCheckpointSpacing(node.prev);
              svg = `${drawBranch(
                node,
                y - previousSpacing,
                index - 1,
                previousSpacing
              )}${svg}`;
            }
            break;
        }

        return svg;
      },
      timelineStyle
    );

    return timelineSvg;
  };

  const getDotString = (x: number, y: number) => {
    return `<rect class='dot' width=${dotSize} height=${dotSize} fill='#111827' x=${
      x - dotSize / 2
    } y=${
      y - dotSize / 2
    } ></rect><circle cx=${x} cy=${y} r='7' stroke=${svgColor} class='dot' ></circle>`;
  };

  const drawDot = (
    timelineNode: LinkedCheckpointNode,
    y: number,
    isDiverged: boolean
  ) => {
    const { next, alignment } = timelineNode as LinkedCheckpointNode;

    // Diverging
    if (next && next.type === NodeTypes.DIVERGE) {
      y = y - curveLength + 6 * dotSize;
    }

    // Converging
    if (next && next.type === NodeTypes.CONVERGE) {
      y = y + curveLength - 6 * dotSize;
    }

    const dotString = getDotString(
      alignment === Branch.LEFT ? leftBranchX : rightBranchX,
      y
    );

    const textString = addText(timelineNode, y, isDiverged);

    return `${textString}${dotString}`;
  };

  const addText = (
    timelineNode: LinkedCheckpointNode,
    y: number,
    isDiverged: boolean
  ) => {
    const { title, subtitle, size, image } = timelineNode;

    const offset = isDiverged ? rightBranchX : 10;
    const foreignObjectX = dotSize / 2 + 10 + offset;
    const foreignObjectY = y - dotSize / 2;
    const foreignObjectWidth = svgWidth - (dotSize / 2 + 10 + offset);

    const titleSizeClass =
      size === ItemSize.LARGE ? "text-6xl whitespace-nowrap" : "text-2xl";
    const logoString = image
      ? `<img src='${image}' class='h-8 mb-2' loading='lazy' width='100' height='32' alt='${image}' />`
      : "";
    const subtitleString = subtitle
      ? `<p class='text-xl mt-2 text-gray-200 font-medium tracking-wide'>${subtitle}</p>`
      : "";

    return `<foreignObject x=${foreignObjectX} y=${foreignObjectY} width=${foreignObjectWidth} 
        height=${Math.max(220, timelineNode.spacing || separation) - 20}>${logoString}<p class='${titleSizeClass}'>${title}</p>${subtitleString}</foreignObject>`;
  };

  const drawMainLineSegment = (
    y: number,
    segmentLength: number,
    i: number
  ): string => {
    const lineY = y + segmentLength;

    return `<line class='str' x1=${leftBranchX} y1=${y} x2=${leftBranchX} y2=${lineY} stroke=${svgColor} /><line class='str line-${i}' x1=${leftBranchX} y1=${y} x2=${leftBranchX} y2=${lineY} stroke=${animColor} />`;
  };

  const drawLine = (
    timelineNode: LinkedCheckpointNode,
    y: number,
    i: number,
    isDiverged: boolean,
    nodeSpacing: number
  ) => {
    const { alignment, prev, next } = timelineNode as LinkedCheckpointNode;

    const isPrevDiverge = prev && prev.type === NodeTypes.DIVERGE;
    const isNextConverge = next && next.type === NodeTypes.CONVERGE;

    const lineY = Math.abs(y + nodeSpacing);

    // Smaller line for Diverging
    if (isPrevDiverge) {
      return `<line class='str' x1=${leftBranchX} y1=${y} x2=${leftBranchX} y2=${lineY} stroke=${svgColor} /><line class='str line-${i}' x1=${leftBranchX} y1=${y} x2=${leftBranchX} y2=${lineY} stroke=${animColor} />`;
    }

    // Smaller line for Converging
    if (isNextConverge) {
      return `<line class='str' x1=${leftBranchX} y1=${y} x2=${leftBranchX} y2=${lineY} stroke=${svgColor} /><line class='str line-${i}' x1=${leftBranchX} y1=${y} x2=${leftBranchX} y2=${lineY} stroke=${animColor} />`;
    }

    const lineX = alignment === Branch.LEFT ? leftBranchX : rightBranchX;

    let str = `<line class='str' x1=${lineX} y1=${y} x2=${lineX} y2=${lineY} stroke=${svgColor} /><line class='str line-${i}' x1=${lineX} y1=${y} x2=${lineX} y2=${lineY} stroke=${animColor} />`;

    // If already diverged, draw parallel line to the existing line
    if (isDiverged) {
      const divergedLineX =
        alignment === Branch.LEFT ? rightBranchX : leftBranchX;
      str = str.concat(
        `<line class='str' x1=${divergedLineX} y1=${y} x2=${divergedLineX} y2=${lineY} stroke=${svgColor} /><line class='str line-${i}' x1=${divergedLineX} y1=${y} x2=${divergedLineX} y2=${lineY} stroke=${animColor} />`
      );
    }
    return str;
  };

  const drawBranch = (
    timelineNode: LinkedBranchNode,
    y: number,
    i: number,
    branchSpacing: number
  ) => {
    const { type } = timelineNode;

    switch (type) {
      case NodeTypes.DIVERGE:
        return `<path class='str' d='M ${leftBranchX} ${y} C ${leftBranchX} ${
          y + curveLength / 2
        } ${rightBranchX} ${y + curveLength / 2} ${rightBranchX} ${
          y + curveLength
        }' stroke=${svgColor} /><line class='str' x1=${rightBranchX} y1=${
          y + curveLength
        } x2=${rightBranchX} y2=${
          y + branchSpacing
        } stroke=${svgColor} /><path class='str anim-branch branch-${i}' d='M ${leftBranchX} ${y} C ${leftBranchX} ${
          y + curveLength / 2
        } ${rightBranchX} ${y + curveLength / 2} ${rightBranchX} ${
          y + curveLength
        }' stroke=${animColor} /><line class='str branch-line-${i}' x1=${rightBranchX} y1=${
          y + curveLength
        } x2=${rightBranchX} y2=${y + branchSpacing} stroke=${animColor} />`;
      case NodeTypes.CONVERGE:
        return `<path class='str' d='M ${rightBranchX} ${
          y + branchSpacing - curveLength
        } C ${rightBranchX} ${
          y + branchSpacing - curveLength + curveLength / 2
        } ${leftBranchX} ${
          y + branchSpacing - curveLength + curveLength / 2
        } ${leftBranchX} ${
          y + branchSpacing
        }' stroke=${svgColor} /><line class='str' x1=${rightBranchX} y1=${y} x2=${rightBranchX} y2=${Math.abs(
          y + branchSpacing - curveLength
        )} stroke=${svgColor} /><path class='str anim-branch branch-${i}' d='M ${rightBranchX} ${
          y + branchSpacing - curveLength
        } C ${rightBranchX} ${
          y + branchSpacing - curveLength + curveLength / 2
        } ${leftBranchX} ${
          y + branchSpacing - curveLength + curveLength / 2
        } ${leftBranchX} ${
          y + branchSpacing
        }' stroke=${animColor} /><line class='str branch-line-${i}' x1=${rightBranchX} y1=${y} x2=${rightBranchX} y2=${Math.abs(
          y + branchSpacing - curveLength
        )} stroke=${animColor} />`;
      default:
        return "";
    }
  };

  const addLineSvgAnimation = (
    timeline: GSAPTimeline,
    duration: number,
    index: number
  ): GSAPTimeline => {
    const startTime = `start+=${duration * index}`;

    timeline.from(
      svgContainer.current.querySelectorAll(`.line-${index + 1}`),
      { scaleY: 0, duration },
      startTime
    );

    return timeline;
  };

  const addDivergingBranchLineAnimation = (
    timeline: GSAPTimeline,
    duration: number,
    index: number
  ): GSAPTimeline => {
    timeline
      .from(
        svgContainer.current.querySelector(`.line-${index + 1}`),
        { scaleY: 0, duration },
        `start+=${duration * index}`
      )
      .from(
        svgContainer.current.querySelector(`.branch-${index + 1}`),
        { strokeDashoffset: 186, duration: duration - 2 },
        `start+=${duration * index}`
      )
      .from(
        svgContainer.current.querySelector(`.branch-line-${index + 1}`),
        { scaleY: 0, duration: duration - 1 },
        `start+=${duration * (index + 1) - 2}`
      );

    return timeline;
  };

  const addConvergingBranchLineAnimation = (
    timeline: GSAPTimeline,
    duration: number,
    index: number
  ): GSAPTimeline => {
    timeline
      .from(
        svgContainer.current.querySelector(`.line-${index + 1}`),
        { scaleY: 0, duration },
        `start+=${duration * index}`
      )
      .from(
        svgContainer.current.querySelector(`.branch-line-${index + 1}`),
        { scaleY: 0, duration: duration - 1 },
        `start+=${duration * index}`
      )
      .from(
        svgContainer.current.querySelector(`.branch-${index + 1}`),
        { strokeDashoffset: 186, duration: duration - 2 },
        `start+=${duration * (index + 1) - 1}`
      );

    return timeline;
  };

  const animateTimeline = (timeline: GSAPTimeline, duration: number): void => {
    let index = 0;

    addNodeRefsToItems(TIMELINE).forEach((item) => {
      const { type } = item;

      if (type === NodeTypes.CHECKPOINT && item.shouldDrawLine) {
        const { next, prev } = item;

        if (prev?.type === NodeTypes.DIVERGE) {
          addDivergingBranchLineAnimation(timeline, duration, index);
        } else if (next?.type === NodeTypes.CONVERGE) {
          addConvergingBranchLineAnimation(timeline, duration, index);
        } else {
          addLineSvgAnimation(timeline, duration, index);
        }

        index++;
      }

      if (
        type === NodeTypes.CHECKPOINT &&
        item.size === ItemSize.LARGE &&
        item.next?.type === NodeTypes.CHECKPOINT &&
        item.next.size === ItemSize.LARGE
      ) {
        addLineSvgAnimation(timeline, duration, index);
        index++;
      }
    });
  };

  const setTimelineSvg = (
    svgContainer: MutableRefObject<HTMLDivElement>,
    timelineSvg: MutableRefObject<SVGSVGElement>
  ) => {
    const containerWidth = svgContainer.current.clientWidth;
    setSvgWidth(containerWidth);

    const resultSvgString = generateTimelineSvg(TIMELINE);
    timelineSvg.current.innerHTML = resultSvgString;

    if (isSmallScreen()) {
      setRightBranchX(70);
    }
  };

  const setSlidesAnimation = (timeline: GSAPTimeline): void => {
    svgCheckpointItems.forEach((_, index) => {
      // all except the first slide
      if (index !== 0) {
        timeline.fromTo(
          screenContainer.current.querySelector(`.slide-${index + 1}`),
          { opacity: 0 },
          { opacity: 1 }
        );
      }

      // all except the last slide
      if (index !== svgCheckpointItems.length - 1) {
        timeline.to(
          screenContainer.current.querySelector(`.slide-${index + 1}`),
          {
            opacity: 0,
            delay: 2.35,
          }
        );
      }
    });
  };

  const initScrollTrigger = (): {
    timeline: GSAPTimeline;
    duration: number;
  } => {
    const timeline = gsap
      .timeline({ defaults: { ease: Linear.easeNone, duration: 0.44 } })
      .addLabel("start");

    let duration: number;
    let trigger: HTMLDivElement;
    let start: string;
    let end: string;
    let additionalConfig = {};

    // Slide as a trigger for Desktop
    if (isDesktop && !isSmallScreen()) {
      // Animation for right side slides
      setSlidesAnimation(timeline);

      const platformHeight =
        screenContainer.current.getBoundingClientRect().height;

      trigger = screenContainer.current;
      start = `top ${(window.innerHeight - platformHeight) / 2}`;
      end = `+=${Math.max(previewTravelDistance, platformHeight)}`;
      additionalConfig = {
        pin: true,
        pinSpacing: true,
      };
      duration = timeline.totalDuration() / animationSegmentCount;
    } else {
      // Clearing out the right side on mobile devices
      screenContainer.current.innerHTML = "";

      trigger = svgContainer.current;
      start = "top center";
      end = `+=${svgLength}`;
      duration = 3;
    }

    ScrollTrigger.create({
      ...additionalConfig,
      trigger,
      start,
      end,
      scrub: 0,
      animation: timeline,
    });
    return { timeline, duration };
  };

  useEffect(() => {
    // Generate and set the timeline svg
    setTimelineSvg(svgContainer, timelineSvg);

    const { timeline, duration }: { timeline: GSAPTimeline; duration: number } =
      initScrollTrigger();

    // Animation for Timeline SVG
    animateTimeline(timeline, duration);
  }, [
    timelineSvg,
    svgContainer,
    svgWidth,
    rightBranchX,
    screenContainer,
    svgCheckpointItems.length,
    isDesktop,
    svgLength,
    previewTravelDistance,
  ]);

  const renderSlides = (): React.ReactNode => (
    <div
      className="max-w-full h-96 shadow-xl bg-gray-800 rounded-2xl overflow-hidden"
      ref={screenContainer}
    >
      <Image
        className="w-full h-8"
        src="/timeline/title-bar.svg"
        alt="Title bar"
        width={644}
        height={34}
      />
      <div className="relative h-full w-full -mt-2">
        <div className="absolute top-0 left-0 h-full w-full">
          {svgCheckpointItems.map((item, index) => {
            const checkpoint = item as CheckpointNode;
            const slideClass = `slide-${index + 1}`;

            if (checkpoint.slideImage) {
              return (
                <Image
                  className={`w-full absolute top-0 object-cover ${slideClass}`}
                  src={checkpoint.slideImage}
                  key={`${checkpoint.title}-${index}`}
                  alt={checkpoint.title}
                  layout="fill"
                />
              );
            }

            return (
              <div
                className={`absolute inset-0 flex flex-col justify-center p-10 ${slideClass}`}
                key={`${checkpoint.title}-${index}`}
              >
                <p className="text-2xl font-semibold">{checkpoint.title}</p>
                {checkpoint.subtitle && (
                  <p className="text-lg mt-4 text-gray-200">
                    {checkpoint.subtitle}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSVG = (): React.ReactNode => (
    <svg
      width={svgWidth}
      height={svgLength}
      viewBox={`0 0 ${svgWidth} ${svgLength}`}
      fill="none"
      ref={timelineSvg}
      style={{ overflow: "visible" }}
    ></svg>
  );

  const renderSectionTitle = (): React.ReactNode => (
    <div className="flex flex-col">
      <p className="section-title-sm seq">MILESTONES</p>
      <h1 className="section-heading seq mt-2">Timeline</h1>
      <h2 className="text-2xl md:max-w-2xl w-full seq mt-2">
        A quick recap of proud moments
      </h2>
    </div>
  );

  return (
    <section
      className="w-full relative select-none min-h-screen section-container py-8 flex flex-col justify-center"
      id={MENULINKS[3].ref}
    >
      {renderSectionTitle()}
      <div className="grid grid-cols-12 gap-4 mt-20">
        <div className="col-span-12 md:col-span-6 line-svg" ref={svgContainer}>
          {renderSVG()}
        </div>
        <div className="col-span-12 md:col-span-6 md:flex hidden">
          {renderSlides()}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;

type LinkedTimelineNode = LinkedCheckpointNode | LinkedBranchNode;

type LinkedCheckpointNode = LinkNode & CheckpointNode;

type LinkedBranchNode = LinkNode & BranchNode;

interface LinkNode {
  next?: LinkedTimelineNode;
  prev?: LinkedTimelineNode;
}
