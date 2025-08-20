import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import StyleChecker from 'components/styleChecker/StyleChecker';
import HeaderNav from 'components/HeaderNav';
import 'assets/styles/checker.css';
import { HeadProvider, Title, Meta } from 'react-head';
import AdLayout from 'components/AdLayout';

const StyleCheckerPage = () => {
  useEffect(() => {
    ReactModal.setAppElement("#root");
  }, []);

  return (
    <>
      <HeadProvider>
        <div>
          <Title>スタイル所持率チェッカー</Title>
          <Meta name="description" content="スタイル所持率チェッカー" />
        </div>
      </HeadProvider>
      <HeaderNav />
      <AdLayout>
        <StyleChecker />
      </AdLayout>
    </>
  );
};

export default StyleCheckerPage;