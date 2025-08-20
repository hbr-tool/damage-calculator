import React from 'react';
import HeaderNav from 'components/HeaderNav';
import Index from 'components/Index';
import { HeadProvider, Title, Meta } from 'react-head';

const IndexPage = () => {
  return (
    <>
      <HeadProvider>
        <div>
          <Title>ヘブバン便利Tools</Title>
          <Meta name="description" content="ヘブバン便利Tools" />
        </div>
      </HeadProvider>
      <HeaderNav />
      <Index />
    </>
  );
};

export default IndexPage;