import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import StyleListProvider from 'components/StyleListProvider';
import DamageCalculation from 'components/dmgCalc/DamageCalculation';
import { updateEnemyStatus } from 'components/dmgCalc/logic';
import HeaderNav from 'components/HeaderNav';
import 'assets/styles/damage.css';
import { HeadProvider, Title, Meta } from 'react-head';
import AdLayout from 'components/AdLayout';

const DmgCalcPage = () => {

  useEffect(() => {
    ReactModal.setAppElement("#root");
    for (let i = 0; i < 10; i++) {
      let freeEnemy = localStorage.getItem("free_enemy_" + i);
      if (freeEnemy !== null) {
        try {
          updateEnemyStatus(i, JSON.parse(freeEnemy));
        } catch (e) {
          // パースエラー時の処理
          console.error(`free_enemy_${i} の取得に失敗しました`, e);
        }
      }
    }
  }, []);

  return (
    <>
      <HeadProvider>
        <div>
          <Title>ダメージ計算ツール</Title>
          <Meta name="description" content="ダメージ計算ツール" />
        </div>
      </HeadProvider>
      <HeaderNav />
      <AdLayout>
        <StyleListProvider>
          <DamageCalculation />
        </StyleListProvider>
      </AdLayout>
    </>
  );
};

export default DmgCalcPage;