const ConstraintsList = () => {
    const [key, setKey] = React.useState(0);

    window.updateConstraints = () => {
        setKey(key + 1);
    }

    return ( constraints_list.length == 0 ?
        null
        :
        <div className="surround_area mx-auto mt-2 adjust_width" id="detail_setting">
            <label className="area_title">制約事項</label>
            <ul className="text-sm ml-2">
                <label>以下のアビリティは現在発動しません。</label>
                {constraints_list.map((ability_no, index) => {
                    let ability_info = getAbilityInfo(ability_no);
                    return (<li key={index}>{`・${ability_info.ability_name} ${ability_info.ability_explan}`}</li>)
                })
                }
            </ul>
        </div>
    )
};