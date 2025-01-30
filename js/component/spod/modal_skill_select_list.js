const SkillCheckComponent = ({ skill, exclusion_skill_list, changeSkillList }) => {
    const skill_id = skill.skill_id;
    const checked = !exclusion_skill_list.includes(skill_id);
    return (
        <div key={skill_id}>
            <input className="passive_skill" id={`skill_${skill_id}`} type="checkbox" checked={checked} onChange={e => changeSkillList(e, skill_id)} />
            <label className="checkbox01" htmlFor={`skill_${skill_id}`}>{skill.skill_name}</label>
        </div>
    );
}

const SkillSelectListComponent = () => {

    const [skillSet, setSkillSet] = React.useState({
        skill_list: [],
        exclusion_skill_list: [],
    });

    window.setSkillList = (skill_list, exclusion_skill_list) => {
        const state = { skill_list: skill_list, exclusion_skill_list: exclusion_skill_list }
        setSkillSet(state);
    }

    const changeSkillList = (e, skill_id) => {
        let exclusion_skill_list = skillSet.exclusion_skill_list;
        const checked = e.target.checked;
        if (checked) {
            exclusion_skill_list.splice(exclusion_skill_list.indexOf(skill_id), 1);
        } else {
            exclusion_skill_list.push(skill_id);
        }
        setSkillSet({ ...skillSet, exclusion_skill_list: exclusion_skill_list });
    }

    const clickReleaseBtn = () => {
        let exclusion_skill_list = skillSet.exclusion_skill_list;
        exclusion_skill_list.splice(0);
        skillSet.skill_list.forEach(element => {
            exclusion_skill_list.push(element.skill_id);
        });
        setSkillSet({ ...skillSet, exclusion_skill_list: exclusion_skill_list });
    }

    const closeModal = () => {
        MicroModal.close('modal_skill_select_list');
    }
    // 習得スキルは同一スキルを排除
    const learn_skill_list = Array.from(
        new Map(skillSet.skill_list.filter((skill) => skill.skill_id < 9000 && skill.skill_active == 0).map(item => [item.skill_id, item])).values()
      );
    const passive_skill_list = skillSet.skill_list.filter((skill) => skill.skill_id < 9000 && skill.skill_active == 1);
    const orb_skill_list = skillSet.skill_list.filter((skill) => skill.skill_id > 9000);
    return (
        <>
            <div className="skill_select_container">
                <label className="modal_label">スキル設定</label>
                <button className="modal-close" aria-label="Close modal" onClick={closeModal}>&times;</button>
            </div>
            <div className="text-sm text-right">
                <input className="w-20 mt-2 mb-2 default" defaultValue="すべてはずす" type="button" onClick={clickReleaseBtn} />
            </div>
            <div id="exclusion_skill_list">
                <label>■習得スキル</label>
                {learn_skill_list.map((skill) =>
                    <SkillCheckComponent key={`skill${skill.skill_id}`} skill={skill} exclusion_skill_list={skillSet.exclusion_skill_list} changeSkillList={changeSkillList} />
                )}
                {passive_skill_list.length > 0 ?
                    <>
                        <label>■パッシブスキル</label>
                        {passive_skill_list.map((skill) =>
                            <SkillCheckComponent key={`skill${skill.skill_id}`} skill={skill} exclusion_skill_list={skillSet.exclusion_skill_list} changeSkillList={changeSkillList} />
                        )}
                    </>
                    : null
                }
                <label>■オーブスキル</label>
                {orb_skill_list.map((skill) =>
                    <SkillCheckComponent key={`skill${skill.skill_id}`} skill={skill} exclusion_skill_list={skillSet.exclusion_skill_list} changeSkillList={changeSkillList} />
                )}
            </div>
        </>
    )
};
$(function () {
    const rootElement = document.getElementById('skill_select_list');
    ReactDOM.createRoot(rootElement).render(<SkillSelectListComponent />);
});