import React from 'react';
import HeaderNav from 'components/HeaderNav';
import { HeadProvider, Title, Meta } from 'react-head';

const CharaMgmtPage = () => {
  return (
    <>
      <HeadProvider>
        <div>
          <Title>キャラ管理ツール</Title>
          <Meta name="description" content="キャラ管理ツール" />
        </div>
      </HeadProvider>
      <HeaderNav />
      <iframe
        src={`${process.env.PUBLIC_URL}/chara_mgmt.html`}
        title="レガシーページ"
        style={{ width: '100%', height: 'calc(100svh - 60px)', border: 'none' }}
      />
    </>
  );
};

export default CharaMgmtPage;