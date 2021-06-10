import { Component } from 'react';
import * as fa from 'react-icons/fa';
import '../App.css';

class Help extends Component {
  render = () => {
    return (
      <div className="center">
        <div className="label">- What's TipLSK? -</div>
        <div className="note">Lisk SDKで作成されたブロックチェーン上で稼働しているサービスだよ。</div>

        <div className="label">- Link -</div>
        <ul>
          <li>Developer: <a href="https://twitter.com/ys_mdmg" target="_" className="link2">万博おじ&nbsp;<fa.FaTwitter /></a></li>
          <li>Source: <a href="https://github.com/lisknonanika/new-tiplsk" target="_" className="link2">lisknonanika/new-tiplsk&nbsp;<fa.FaGithub /></a></li>
          <li>Lisk Official: <a href="https://lisk.com" target="_" className="link2">Lisk&nbsp;<fa.FaLink /></a></li>
          <li>Lisk SDK: <a href="https://github.com/LiskHQ/lisk-sdk" target="_" className="link2">LiskHQ/lisk-sdk&nbsp;<fa.FaGithub /></a></li>
        </ul>
      </div>
    );
  }
}

export default Help;