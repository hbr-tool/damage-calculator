


const BuffDetailLabelComponent = ({ buff }) => {
    let img = getBuffIconImg(buff);
    let buff_kind_name = getBuffKindName(buff);
    let buff_text = buff.buff_name;
    switch (buff.buff_kind) {
        case BUFF_MORALE: // 士気
            buff_text += `(Lv${buff.lv})`;
            break;
        default:
            if (buff.rest_turn > 0) {
                buff_text += `(残りターン${buff.rest_turn})`;
            }
            break;
    }
    return (
        < div className="flex detail_line_height" >
            <img className="icon_buff_detail" src={img} />
            <label>
                {buff_kind_name}
                <br />
                {buff_text}
            </label>
        </div >
    )
};

const BuffDetailListComponent = () => {

    const [buffList, setBuffList] = React.useState([]);

    window.setBuffList = (buff_list) => {
        setBuffList(buff_list);
    }

    return (
        <div>
            <div className="mb-4">
                <label className="modal_label">バフ一覧</label>
                {buffList.map((buff, index) => {
                    return <BuffDetailLabelComponent buff={buff} key={`buff_detail_label${index}`} />
                })}
            </div>
            <div id="buff_detail"></div>
        </div>
    )
};
$(function () {
    const rootElement = document.getElementById('buff_detail_list');
    ReactDOM.createRoot(rootElement).render(<BuffDetailListComponent />);
});