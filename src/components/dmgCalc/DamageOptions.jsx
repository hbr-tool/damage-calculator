import React from "react";
import NumberInput from "./NumberInput";

const DamageOptions = ({ argument }) => {
    const {
        attackInfo,
        dispatch,
        damageOption,
        setDamageOption,
    } = argument;

    const changeOptinon = (key, value) => {
        let newSetting = { ...damageOption, [key]: Number(value) ?? 0 };
        setDamageOption(newSetting);

        if (attackInfo) {
            switch (key) {
                case "elementDown":
                    dispatch({ type: "SET_RRGIST_DOWN", element: attackInfo.attack_element, value: Number(value) });
                    break;
                case "physicalDown":
                    dispatch({ type: "SET_PHYSICAL_DOWN", element: attackInfo.attack_physical, value: Number(value) });
                    break;
                default:
                    break;
            };

        }
    };
    return (
        <div className="mt-2">
            <div></div>
            <div class="grid grid-cols-[3fr_4fr] items-start">
                <div class="grid grid-cols-[2fr_65px] gap-y-0.5">
                    <div class="text-center">攻撃力アップ</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.attackUp}
                            onChange={(e) => changeOptinon("attackUp", e)} />%
                    </div>
                    <div class="text-center">CRT率アップ</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.criticalRateUp}
                            onChange={(e) => changeOptinon("criticalRateUp", e)} />%
                    </div>
                    <div class="text-center">CRTダメアップ</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.criticalDamageUp}
                            onChange={(e) => changeOptinon("criticalDamageUp", e)} />%
                    </div>
                    <div class="text-center">破壊率上昇</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.damageRateUp}
                            onChange={(e) => changeOptinon("damageRateUp", e)} />%
                    </div>
                    <div class="text-center">武器属性ダウン</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.physicalDown}
                            onChange={(e) => changeOptinon("physicalDown", e)} />%
                    </div>
                    <div class="text-center">属性耐性ダウン</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.elementDown}
                            onChange={(e) => changeOptinon("elementDown", e)} />%
                    </div>
                </div>
                <div class="grid grid-cols-[2fr_65px] gap-y-0.5">
                    <div class="text-center">スキル攻撃力UPの効果量</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.attackUpEffectUp}
                            onChange={(e) => changeOptinon("attackUpEffectUp", e)} />%
                    </div>
                    <div class="text-center">防御ダウンの効果量</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.defenseDownEffectUp}
                            onChange={(e) => changeOptinon("defenseDownEffectUp", e)} />%
                    </div>
                    <div class="col-span-2  flex items-center justify-between">
                        <span class="ml-14">連撃数アップ</span>
                        <select className="text-center" value={damageOption.funnelUp} onChange={(e) => changeOptinon("funnelUp", e.target.value)}>
                            <option value={0}>無し</option>
                            <option value={1}>大×1</option>
                            <option value={2}>大×2</option>
                            <option value={3}>大×3</option>
                            <option value={4}>大×4</option>
                            <option value={5}>大×5</option>
                            <option value={6}>大×6</option>
                            <option value={11}>特大×1</option>
                            <option value={12}>特大×2</option>
                            <option value={13}>特大×3</option>
                            <option value={14}>特大×4</option>
                            <option value={15}>特大×5</option>
                            <option value={16}>特大×6</option>
                        </select>
                    </div>
                    <div class="text-center">敵ダメージ補正</div>
                    <div>
                        <NumberInput className="w-12 text-center" value={damageOption.enemyDefenseRate}
                            onChange={(e) => changeOptinon("enemyDefenseRate", e)} />%
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DamageOptions;