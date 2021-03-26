import { Component } from 'react';
import { Mnemonic } from '@liskhq/lisk-passphrase';
import { getBase32AddressFromPassphrase } from '@liskhq/lisk-cryptography';
import * as fa from 'react-icons/fa';
import '../App.css';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      account: {
        passphrase: "",
        address: ""
      }
    }
    this.getAddressAndPassphrase = this.getAddressAndPassphrase.bind(this);
    this.copyText = this.copyText.bind(this);
  }

  getAddressAndPassphrase = (e) => {
    const passphrase = Mnemonic.generateMnemonic();
    const address = getBase32AddressFromPassphrase(passphrase, "tip");
    this.setState({
      account: {
        passphrase: passphrase,
        address: address
      }
    });
  }

  copyText = (e) => {
    e.target.select();
    document.execCommand('copy');
    window.alert("コピーしました！")
  }

  render = () => {
    return (
      <div className="center">
        <div className="label">はじめに</div>
        <div className="note">
          TipLSKを使うためにはTipLSKアドレスが必要だよ。
          <br></br>
          持ってない人は下のボタンから生成してね。
        </div>
        <button onClick={this.getAddressAndPassphrase}>TipLSKちゃんアドレスを作成する</button>
        {this.state.account.address !==""?
          <div style={{paddingTop: "10px"}}>
            <div className="label" style={{paddingTop: "10px"}}>- アドレス -</div>
            <div className="copy-text"><div className="copy-icon"><fa.FaCopy/></div><input type="text" value={this.state.account.address} readOnly onClick={this.copyText}/></div>
            <div className="label" style={{paddingTop: "10px"}}>- パスフレーズ -</div>
            <div className="copy-text"><div className="copy-icon"><fa.FaCopy/></div><input type="text" value={this.state.account.passphrase} readOnly onClick={this.copyText}/></div>
            <div className="note small">※アドレスとパスフレーズは忘れないでね。</div>
          </div>
        : ""}
        <div className="note" style={{paddingTop: "20px"}}>使い方は<a href="./howto" target="_" className="link2">HowTo</a>を見てね。</div>
      </div>
    );
  }
}

export default Home;