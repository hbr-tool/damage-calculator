import React from 'react';
import frend from 'assets/img/frend.png';
import AmazonButton from './AmazonButton';

const Index = () => {

  return (
    <>
      <div className="frame static w-screen index-page overflow-y-scroll">
        <div className="flex">
          <div className="p-6 max-w-[900px] mx-auto">
            <h1 className="text-4xl font-bold">このサイトについて</h1>
            <p>
              このサイトは、 ヘブバン(ヘブンバーンズレッド)をプレイしていく上で、
            </p>
            <p>役立つツールを提供しています。</p>
            <h2 className="text-2xl font-bold mt-2">ダメージ計算ツール</h2>
            <p>与ダメージの自動計算ツールです。</p>
            <p>以下のサイトの情報に基づき、計算しています。</p>
            <p>
              参考サイト：
              <a
                className="text-blue-500 underline hover:text-blue-700 hover:underline focus:outline-none focus:underline"
                href="https://note.com/gazou774/n/n82b99b359f2b">
                ヘブバン攻略情報まとめ
              </a>
            </p>
            <p>
              限界突破数、ステータス、宝珠レベルや、設定した部隊情報は、端末に保存されます。
            </p>
            <h2 className="text-2xl font-bold mt-2">OD/SPシミュレータ</h2>
            <p>戦闘時のSPやODのシミュレーションを行えます。</p>
            <p>
              シミュレーションした内容を端末に保存や、ダウンロードして保存や読み込みが可能です。
            </p>
            <h2 className="text-2xl font-bold mt-2">スタイル所持率チェッカー</h2>
            <p>実装済みのSSスタイルの所持率チェッカーです。</p>
            <p>取得結果をX(旧Twitter)にPOSTすることができます。</p>
            <p>取得済みのスタイル情報は、端末に保存されます。</p>
            <h2 className="text-2xl font-bold mt-2">アーツデッキ画像生成</h2>
            <p>アーツバトルのデッキ画像を生成するだけのツールです。</p>
            <p>出力単位をシーズンごとに選べます。</p>
            <h2 className="text-2xl font-bold mt-2">キャラクター管理ツール</h2>
            <p>
              キャラクター単位でのレベル上限やオーブスキル習得状況を一覧で管理するツールです。
            </p>
            <p>
              設定内容は端末に保存されますが、ダウンロードして保存や読み込みが可能です。
            </p>
            <h2 className="text-xl font-bold mt-10">制作者を支援</h2>
            <AmazonButton />
            <div>
              <p>また、招待コードを置いておきますので、良ければ使用してください。</p>
              <p className="font-bold ml-2">2a7adc6ps3n0ib1s</p>
              <img src={frend} alt='招待コード'/>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-right mr-5">
          <p className="text-blue-500 underline hover:text-blue-700 hover:underline focus:outline-none focus:underline">
            <a href="#/privacy">プライバシーポリシー</a>
          </p>
          ©VisualArt's/Key/Angel Beats! Project　©WFS Developed by WRIGHT FLYER
          STUDIOS ©VISUAL ARTS/Key
        </div>
      </div>
    </>
  );
};

export default Index;
