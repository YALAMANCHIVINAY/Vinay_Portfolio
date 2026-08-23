import React from "react";
import styles from "./ProjectPreview.module.scss";

const Dot = ({ active = false }: { active?: boolean }) => (
  <span className={`${styles.dot} ${active ? styles.dotActive : ""}`} />
);

export const ProjectPreview = ({ type }: { type: string }) => {
  if (type === "interview") {
    return (
      <div className={`${styles.previewShell} ${styles.interview}`}>
        <div className={styles.previewHeader}>
          <div><span className={styles.brandMark}>AI</span><span>Interview Session</span></div>
          <span className={styles.livePill}><Dot active /> Recording</span>
        </div>
        <div className={styles.interviewGrid}>
          <div className={styles.questionPanel}>
            <span className={styles.eyebrow}>QUESTION 04 / 08</span>
            <strong>Describe a project where you improved model performance.</strong>
            <div className={styles.waveform}>{[8,16,10,22,13,28,18,24,11,20,8,16,12,25,17,12].map((h,i)=><i key={i} style={{height:h}} />)}</div>
            <small>00:48 spoken • transcript active</small>
          </div>
          <div className={styles.scorePanel}>
            <div className={styles.scoreRing}><b>86</b><span>confidence</span></div>
            <div className={styles.metricRow}><span>Relevance</span><b>91%</b></div>
            <div className={styles.metricBar}><i style={{width:"91%"}} /></div>
            <div className={styles.metricRow}><span>Fluency</span><b>84%</b></div>
            <div className={styles.metricBar}><i style={{width:"84%"}} /></div>
          </div>
        </div>
        <div className={styles.feedbackRow}>
          <span>Semantic match strong</span><span>2 filler words</span><span>Pause rate stable</span>
        </div>
      </div>
    );
  }

  if (type === "hosting") {
    return (
      <div className={`${styles.previewShell} ${styles.hosting}`}>
        <div className={styles.previewHeader}>
          <div><span className={styles.hexMark}>◇</span><span>Decentralized Hosting</span></div>
          <span className={styles.statusPill}>Network healthy</span>
        </div>
        <div className={styles.hostingTop}>
          <div><span className={styles.eyebrow}>DEPLOYED SITE</span><strong>portfolio.web3</strong><small>Content replicated across distributed nodes</small></div>
          <div className={styles.integrity}><b>100%</b><span>Integrity</span></div>
        </div>
        <div className={styles.nodeMap}>
          <svg viewBox="0 0 360 92" aria-hidden="true">
            <path d="M55 44 L130 20 L204 48 L290 24 M130 20 L126 72 L204 48 L284 70 M55 44 L126 72 M290 24 L284 70" />
            {[ [55,44],[130,20],[204,48],[290,24],[126,72],[284,70] ].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===2?9:6} />)}
          </svg>
        </div>
        <div className={styles.hostingMetrics}>
          <div><span>Nodes</span><b>06 online</b></div><div><span>Block hash</span><b>8f3a…91c2</b></div><div><span>Uptime</span><b>99.98%</b></div>
        </div>
      </div>
    );
  }

  if (type === "tts") {
    return (
      <div className={`${styles.previewShell} ${styles.tts}`}>
        <div className={styles.previewHeader}>
          <div><span className={styles.audioMark}>▶</span><span>TTS Performance Lab</span></div>
          <span className={styles.statusPill}>Sample run • FPT.AI</span>
        </div>
        <div className={styles.textInput}>"Evaluate end-to-end text-to-speech conversion latency…"</div>
        <div className={styles.audioPanel}>
          <button aria-label="Play sample">▶</button>
          <div className={styles.bigWave}>{[12,19,32,18,25,40,28,16,36,23,31,15,26,39,20,12,30,18,24,13].map((h,i)=><i key={i} style={{height:h}} />)}</div>
          <span>0:07.4</span>
        </div>
        <div className={styles.ttsMetrics}>
          <div><span>Total conversion</span><b>1.84s</b></div>
          <div><span>Local processing</span><b>0.42s</b></div>
          <div><span>Remote API</span><b>1.42s</b></div>
        </div>
        <div className={styles.latencyBar}><i style={{width:"23%"}}/><i style={{width:"77%"}}/></div>
      </div>
    );
  }

  return (
    <div className={`${styles.previewShell} ${styles.iot}`}>
      <div className={styles.previewHeader}>
        <div><span className={styles.iotMark}>⌁</span><span>IoT Control Dashboard</span></div>
        <span className={styles.livePill}><Dot active /> Automation on</span>
      </div>
      <div className={styles.sensorGrid}>
        <div><span>Temperature</span><b>24.6°</b><small>Normal</small></div>
        <div><span>Humidity</span><b>62%</b><small>Stable</small></div>
        <div><span>Soil moisture</span><b>41%</b><small>Monitor</small></div>
        <div><span>Light level</span><b>780</b><small>lux</small></div>
      </div>
      <div className={styles.deviceRow}>
        <div><span className={styles.deviceIcon}>◉</span><span><b>Irrigation</b><small>Scheduled cycle</small></span><i className={styles.toggleOn}/></div>
        <div><span className={styles.deviceIcon}>⌂</span><span><b>Home devices</b><small>Automation active</small></span><i className={styles.toggleOn}/></div>
      </div>
    </div>
  );
};
