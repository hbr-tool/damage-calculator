
const StyleIcon = ({place_no}) => {
    const [styleId, setStyleId] = React.useState([]);

    let style = select_style_list[place_no];
    let icon = "img/plus.png";
    if (style) {
        icon = "icon/" + style.style_info.image_url;
    }

    function showModalStyleSelection() {
        return new Promise((resolve) => {
            MicroModal.show('modal_style_section', {
                onClose: (modal) => {
                    resolve();
                }
            });
        });
    }

    async function openModal(place_no) {
        chara_no = place_no;
        const style_selection = await showModalStyleSelection();
        setStyleId([]);
    }

    return (
        <img
            className="showmodal select_style"
            src={icon}
            onClick={() => {openModal(place_no)}}
        />
    )
};
