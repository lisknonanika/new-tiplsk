import { Component } from 'react';
import * as fa from 'react-icons/fa';
import '../App.css';

class Information extends Component {
  render = () => {
    return (
      <div className="center">
        <div className="label">- TipLSKって何？ -</div>
        <div className="note">Lisk SDKで作成されたブロックチェーン上で稼働しているサービスだよ。</div>

        <div className="label">- TipLSKちゃんって誰？ -</div>
        <div className="note">TipLSKのサービスを提供しているよ。</div>

        <div className="label">- TipLSKちゃんコインって何？ -</div>
        <div className="note">もらうとうれしい(かもしれない)金銭的価値のないコインだよ。</div>

        <div className="label">- リンク集 -</div>
        <ul>
          <li>サービス提供：<a href="https://twitter.com/tiplsk" target="_" className="link2">TipLisk&nbsp;<fa.FaTwitter /></a></li>
          <li>開発：<a href="https://twitter.com/ys_mdmg" target="_" className="link2">万博おじ&nbsp;<fa.FaTwitter /></a></li>
          <li>ソース：<a href="https://github.com/lisknonanika/new-tiplsk" target="_" className="link2">lisknonanika/new-tiplsk&nbsp;<fa.FaGithub /></a></li>
          <li>Lisk 公式：<a href="https://lisk.io" target="_" className="link2">Lisk&nbsp;<fa.FaLink /></a></li>
          <li>Lisk SDK：<a href="https://github.com/LiskHQ/lisk-sdk" target="_" className="link2">LiskHQ/lisk-sdk&nbsp;<fa.FaGithub /></a></li>
        </ul>
      </div>
    );
  }
}

export default Information;