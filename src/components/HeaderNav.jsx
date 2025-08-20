import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import titleLogo from '../assets/img/title_log.png';

const linkList = [
  { url: '/damage', title: 'ダメージ計算ツール' },
  { url: '/simulator', title: 'SP/ODシミュレータ' },
  { url: '/checker', title: 'スタイル所持率チェッカー' },
  { url: '/artslist', title: 'アーツデッキ画像生成' },
  { url: '/management', title: 'キャラ管理ツール' },
  { url: '/', title: 'このサイトについて' },
];

const HeaderNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="header">
      <div className="hamburger">
        <img className="logo" src={titleLogo} alt="ヘブバン便利ツール" />

        <p className="btn-gNav" onClick={toggleNav}>
          <span></span>
          <span></span>
          <span></span>
        </p>

        <nav className={`gNav ${isOpen ? 'open' : ''}`}>
          <ul className="gNav-menu">
            {linkList.map((link, idx) => (
              <li key={idx}>
                  <Link className='header_link' to={link.url}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default HeaderNav;
