
const StyleIcon = ({ style, place_no, onClick }) => {
    let icon = "img/plus.png";
    if (style) {
        icon = "icon/" + style.style_info.image_url;
    }

    return (
        <>
            <img
                className="showmodal select_style"
                src={icon}
                onClick={() => { onClick("style", place_no) }}
            />
        </>
    )
};
