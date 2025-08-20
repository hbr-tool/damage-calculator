import pako from 'pako';
import charaData from 'data/charaData';
import styleList from "data/styleList";
import skillList from "data/skillList";
import skillAttack from "data/skillAttack";
import skillBuff from "data/skillBuff";
import enemyList from 'data/enemyList';
import skillPassive from "data/skillPassive";
import abilityList from "data/abilityList";
import abilityResonance from "data/abilityResonance";

// キャラ名取得
export function getCharaData(charaId) {
  const filteredChara = charaData.filter((obj) => obj.chara_id === charaId);
  return filteredChara.length > 0 ? filteredChara[0] : undefined;
}

// スタイル取得
export function getStyleData(styleId) {
  const filteredStyle = styleList.filter((obj) => obj.style_id === styleId);
  return filteredStyle.length > 0 ? filteredStyle[0] : undefined;
}

// 敵情報取得
export function getEnemyInfo(enemyClass, enemySelect) {
  const filteredEnemy = enemyList.filter((obj) =>
    obj.enemy_class === Number(enemyClass) && obj.enemy_class_no === Number(enemySelect));
  return filteredEnemy.length > 0 ? filteredEnemy[0] : undefined;
}

// スキルデータ取得
export function getSkillData(skillId) {
  const filteredSkill = skillList.filter((obj) => obj.skill_id === Number(skillId));
  return filteredSkill.length > 0 ? filteredSkill[0] : undefined;
}

// スキル攻撃情報取得
export function getAttackInfo(attackId) {
  const filteredAttack = skillAttack.filter((obj) => obj.attack_id === Number(attackId));
  return filteredAttack.length > 0 ? filteredAttack[0] : undefined;
}

// バフ一覧取得
export function getBuffList(skillId) {
    const filteredBuff = skillBuff.filter((obj) => obj.skill_id === Number(skillId));
    return filteredBuff;
}

// バフ情報取得
export function getBuffIdToBuff(buffId) {
  const filteredBuff = skillBuff.filter((obj) => obj.buff_id === Number(buffId));
  return filteredBuff.length > 0 ? filteredBuff[0] : undefined;
}

// アビリティ情報取得
export function getAbilityInfo(abilityId) {
  const filteredAbility = abilityList.filter((obj) => obj.ability_id === Number(abilityId));
  return filteredAbility.length > 0 ? filteredAbility[0] : undefined;
}

// パッシブ情報取得
export function getPassiveInfo(skillId) {
  const filteredPassive = skillPassive.filter((obj) => obj.skill_id === Number(skillId));
  return filteredPassive.length > 0 ? filteredPassive[0] : undefined;
}

// パッシブ情報取得
export function getResonanceInfo(resonanceId) {
  const filteredResonance = abilityResonance.filter((obj) => obj.resonance_id === Number(resonanceId));
  return filteredResonance.length > 0 ? filteredResonance[0] : undefined;
}

// 文字列を圧縮
export function compressString(inputString) {
  const compressedData = pako.deflate(inputString);
  const compressedString = btoa(String.fromCharCode.apply(null, compressedData));
  return compressedString;
}

// 圧縮された文字列を解凍
export function decompressString(compressedString) {
  const compressedDataBuffer = new Uint8Array(atob(compressedString).split('').map(function (c) { return c.charCodeAt(0); }));
  const decompressedData = pako.inflate(compressedDataBuffer);
  const decompressedString = new TextDecoder().decode(decompressedData);
  return decompressedString;
}

// ディープコピー
export function deepClone(instance) {
  // インスタンスがnullまたはundefinedの場合、そのまま返す
  if (instance === null || instance === undefined) return instance;

  // プリミティブ型の場合、そのまま返す
  if (typeof instance !== 'object') return instance;

  // 特殊なオブジェクト型の場合
  if (instance instanceof Date) return new Date(instance);
  if (instance instanceof RegExp) return new RegExp(instance);
  if (instance instanceof Map) return new Map(instance);
  if (instance instanceof Set) return new Set(instance);

  // インスタンスがArrayの場合の処理
  if (Array.isArray(instance)) {
    return instance.map(item => deepClone(item));
  }

  // インスタンスのクラスを取得
  const ClonedClass = instance.constructor;
  // 新しいインスタンスを作成
  const clone = new ClonedClass();

  // プロパティを再帰的にコピー
  for (let key of Object.keys(instance)) {
    clone[key] = deepClone(instance[key]);
  }

  return clone;
}