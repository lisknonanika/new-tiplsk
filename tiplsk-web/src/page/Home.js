import { Component } from 'react';
import { Mnemonic } from '@liskhq/lisk-passphrase';
import { getBase32AddressFromPassphrase } from '@liskhq/lisk-cryptography';
import '../Common.css';

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

  render() {
    return (
      <div className="center">
        <div className="label">はじめに</div>
        <div className="note">
          TipLSKを使うためには、TipLSKアドレスが必要だよ。
          <br></br>
          アドレスを持ってない人は下のボタンから生成してね。
        </div>
        <button onClick={this.getAddressAndPassphrase}>TipLSKちゃんアドレスを作成する</button>
        <div>{this.state.account.address}</div>
        <div>{this.state.account.passphrase}</div>
        <br></br>
        <div className="note">使い方は<a href="./howto" target="_" className="link2">HowTo</a>を見てね。</div>
      </div>
    );
  }
}

export default Home;