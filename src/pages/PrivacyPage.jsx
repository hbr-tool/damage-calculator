import React from 'react';
import HeaderNav from 'components/HeaderNav';
import Privacy from 'components/Privacy';
import { HeadProvider, Title, Meta } from 'react-head';

const PrivacyPage = () => {
  return (
    <>
      <HeadProvider>
        <div>
          <Title>プライバシーポリシー</Title>
          <Meta name="description" content="プライバシーポリシー" />
        </div>
      </HeadProvider>
      <HeaderNav />
      <Privacy />
    </>
  );
};

export default PrivacyPage;