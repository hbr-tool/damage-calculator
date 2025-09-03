import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import StyleListProvider from 'components/StyleListProvider';
import SpOdSimulation from 'components/spodSim/SpodSimulation';
import HeaderNav from 'components/HeaderNav';
import 'assets/styles/simulator.css';
import { HeadProvider, Title, Meta } from 'react-head';

const SpodSimPage = () => {
  useEffect(() => {
    ReactModal.setAppElement("#root");
  }, []);

  return (
    <>
      <HeadProvider>
        <div>
          <Title>SP/ODシミュレータ</Title>
          <Meta name="description" content="SP/ODシミュレータ" />
        </div>
      </HeadProvider>
      <HeaderNav />
      <StyleListProvider>
        <SpOdSimulation />
      </StyleListProvider>
    </>
  );
};

export default SpodSimPage;