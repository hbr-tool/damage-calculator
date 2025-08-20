import React from "react";

// PC 用広告（左右 120x600）
const RakutenAdIframePC = ({ mediaId = "20011811", imgSrc }) => {
  const width = 120;
  const height = 600;

  const srcDoc = `
    <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;overflow:hidden;">
        <script type="text/javascript">
          rakuten_affiliateId="0ea62065.34400275.0ea62066.204f04c0";
          rakuten_items="ranking";
          rakuten_genreId="101205";
          rakuten_recommend="on";
          rakuten_design="slide";
          rakuten_size="${width}x${height}";
          rakuten_target="_blank";
          rakuten_border="on";
          rakuten_auto_mode="on";
          rakuten_adNetworkId="a8Net";
          rakuten_adNetworkUrl="https%3A%2F%2Frpx.a8.net%2F...";
          rakuten_pointbackId="a20031977341_3Z2I86_ER2ODU_2HOM_BS629";
          rakuten_mediaId="${mediaId}";
        </script>
        <script type="text/javascript" src="//xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js"></script>
        <img border="0" width="1" height="1" src="${imgSrc}" alt="">
      </body>
    </html>
  `;

  return (
    <div className="display_pc_only mx-auto mt-20">
      <iframe
        srcDoc={srcDoc}
        style={{ border: "none", width: `${width}px`, height: `${height}px` }}
        title="PC用広告"
        scrolling="no"
        frameBorder="0"
      />
    </div>
  );
};

// SP 用広告（上部 468x60）
const RakutenAdIframeSP = () => {
  const width = 468;
  const height = 60;
  const mediaId = "20011816";
  const imgSrc = "https://www18.a8.net/0.gif?a8mat=3Z2I86+ER2ODU+2HOM+BS629";

  const srcDoc = `
    <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;overflow:hidden;">
        <script type="text/javascript">
          rakuten_affiliateId="0ea62065.34400275.0ea62066.204f04c0";
          rakuten_items="ranking";
          rakuten_genreId="101205";
          rakuten_recommend="on";
          rakuten_design="slide";
          rakuten_size="${width}x${height}";
          rakuten_target="_blank";
          rakuten_border="on";
          rakuten_auto_mode="on";
          rakuten_adNetworkId="a8Net";
          rakuten_adNetworkUrl="https%3A%2F%2Frpx.a8.net%2Fsvt%2Fejp%3Fa8mat%3D3Z2I86%2BER2ODU%2B2HOM%2BBS629%26rakuten%3Dy%26a8ejpredirect%3D";
          rakuten_pointbackId="a20031977341_3Z2I86_ER2ODU_2HOM_BS629";
          rakuten_mediaId="${mediaId}";
        </script>
        <script type="text/javascript" src="//xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js"></script>
        <img border="0" width="1" height="1" src="${imgSrc}" alt="">
      </body>
    </html>
  `;

  return (
    <div className="display_sp_only overflow-x-scroll">
      <iframe
        srcDoc={srcDoc}
        style={{ border: "none", width: `${width}px`, height: `${height}px` }}
        title="スマホ用広告"
        scrolling="no"
        frameBorder="0"
      />
    </div>
  );
};

// 共通レイアウト
const AdLayout = ({ children }) => {
  return (
    <>
      {/* SP 用広告（上部） */}
      <RakutenAdIframeSP />

      {/* PC 用広告（左右）＋中央コンテンツ */}
      <div className="flex">
        <RakutenAdIframePC
          imgSrc="https://www19.a8.net/0.gif?a8mat=3Z2I86+ER2ODU+2HOM+BS629"
        />

        <div className="mx-auto">{children}</div>

        <RakutenAdIframePC
          imgSrc="https://www19.a8.net/0.gif?a8mat=3Z2I86+ER2ODU+2HOM+BS629"
        />
      </div>
    </>
  );
};

export default AdLayout;
