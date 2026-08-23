import Script from "next/script";
import React from "react";
import { GTAG } from "../../constants";

const CHAPORT_APP_ID = process.env.NEXT_PUBLIC_CHAPORT_APP_ID;

const Scripts = React.memo(() => {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GTAG}`}
        strategy="afterInteractive"
      />
      <Script strategy="afterInteractive" id="gtag-config">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
    
            gtag('config', '${GTAG}');
        `}
      </Script>
      {CHAPORT_APP_ID ? (
        <Script strategy="lazyOnload" id="chaport-config">
          {`
            setTimeout(() => {
                (function (w, d, v3) {
                    w.chaportConfig = {
                        appId: '${CHAPORT_APP_ID}',
                        appearance: {
                            teamName: 'Vinay Yalamanchi',
                            onlineWelcome: "Hi! I'm Vinay's portfolio assistant. Ask me about his experience, skills, projects, education, or how to get in touch.",
                            offlineWelcome: "Hi! I'm Vinay's portfolio assistant. Ask me about his experience, skills, projects, education, or how to get in touch."
                        }
                    };
    
                    if (w.chaport) return; v3 = w.chaport = {}; v3._q = []; v3._l = {}; v3.q = function () { v3._q.push(arguments) }; v3.on = function (e, fn) { if (!v3._l[e]) v3._l[e] = []; v3._l[e].push(fn) }; var s = d.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://app.chaport.com/javascripts/insert.js'; var ss = d.getElementsByTagName('script')[0]; ss.parentNode.insertBefore(s, ss)
                })(window, document);
            }, 15000);
        `}
        </Script>
      ) : null}
    </>
  );
});

Scripts.displayName = "Scripts";

export default Scripts;
