
const BuffIconComponent = ({ buff_list, loop_limit, loop_step, place_no, turn_number }) => {
    const scrollContentRef = React.useRef(null);

    React.useEffect(() => {
        const scrollContent = scrollContentRef.current;
        if (!scrollContent) return;

        const styleSheet = document.styleSheets[0];
        const animationName = `scroll-${turn_number}-${place_no}`;

        // 古いアニメーションを削除
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].name === animationName) {
                styleSheet.deleteRule(i);
                break;
            }
        }
        if (buff_list.length > loop_limit * loop_step) {
            scrollContent.classList.add("scroll");

            // 動的アニメーション生成
            const duration = buff_list.length * 0.5; // 例: アイコン数に応じて2秒ごとに1アイコンがスクロール
            const translateXValue = buff_list.length * 24;
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
    }, [buff_list]);

    // バフリストの表示    
    const showBuffList = (e, buff_list) => {
        if (buff_list.length > 0) {
            e.stopPropagation();
            setBuffList(buff_list);
            MicroModal.show('modal_buff_detail_list');
        }
    };

    let className = "scroll-container " + (place_no == 7 ? "enemy_icon_list" : "icon_list");
    return (
        <div className={className} onClick={(e) => showBuffList(e, buff_list)}>
            <div className="scroll-content" ref={scrollContentRef}>
                {buff_list.map((buffInfo, index) => (
                    <img
                        key={index}
                        src={getBuffIconImg(buffInfo)}
                        className="unit_buff"
                    />
                ))}
                {(buff_list.length > loop_limit * loop_step) ?
                    buff_list.map((buffInfo, index) => (
                        <img
                            key={index}
                            src={getBuffIconImg(buffInfo)}
                            className="unit_buff"
                        />
                    )) : null
                }
            </div>
        </div>
    );
}
