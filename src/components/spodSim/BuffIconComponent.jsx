import React from "react";
import buffIcons from 'assets/buffIcons';
import * as logicBuff from "./logicBuff";

const BuffIconComponent = ({ buffList, loopLimit, loopStep, placeNo, turnNumber, clickBuffIcon }) => {
    const scrollContentRef = React.useRef(null);

    React.useEffect(() => {
        const scrollContent = scrollContentRef.current;
        if (!scrollContent) return;

        const styleSheet = Array.from(document.styleSheets).find(sheet => {
            try {
                return sheet.cssRules;
            } catch {
                return false;
            }
        });
        const animationName = `scroll-${turnNumber}-${placeNo}`;

        // 古いアニメーションを削除
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].name === animationName) {
                styleSheet.deleteRule(i);
                break;
            }
        }
        if (buffList.length > loopLimit * loopStep) {
            scrollContent.classList.add("scroll");

            // 動的アニメーション生成
            const duration = buffList.length * 0.5; // 例: アイコン数に応じて2秒ごとに1アイコンがスクロール
            const translateXValue = buffList.length * 24;
            // @keyframesを動的に追加
            const keyframes = `
          @keyframes ${animationName} {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-${translateXValue}px);
            }
          }
        `;

            // 新しいアニメーションを挿入
            styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
            scrollContent.style.animation = `${animationName} ${duration}s linear infinite`;
            scrollContent.classList.remove("flex-wrap");
        } else {
            scrollContent.classList.remove("scroll");
            scrollContent.classList.add("flex-wrap");
        }
    }, [buffList, loopLimit, loopStep, turnNumber, placeNo]);

    return (
        <div className={(placeNo === 7 ? "enemy_icon_list" : "icon_list")}>
            {buffList.length > 0 ?
                <div className="scroll-container" onClick={() => clickBuffIcon(buffList)}>
                    <div className="scroll-content" ref={scrollContentRef}>
                        {buffList.map((buffInfo, index) => (
                            <img
                                key={index}
                                src={buffIcons[logicBuff.getBuffIconImg(buffInfo)]}
                                alt={buffInfo.buff_name}
                                className="unit_buff"
                            />
                        ))}
                        {(buffList.length > loopLimit * loopStep) ?
                            buffList.map((buffInfo, index) => (
                                <img
                                    key={index}
                                    src={buffIcons[logicBuff.getBuffIconImg(buffInfo)]}
                                    alt={buffInfo.buff_name}
                                    className="unit_buff"
                                />
                            )) : null
                        }
                    </div>
                </div>
                : null}
        </div>
    );
}

export default BuffIconComponent;