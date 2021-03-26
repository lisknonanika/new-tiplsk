
import { Component } from 'react';
import { createWSClient } from '@liskhq/lisk-api-client';
import { getBase32AddressFromAddress, getAddressFromBase32Address, hexToBuffer } from '@liskhq/lisk-cryptography';
import { convertBeddowsToLSK } from '@liskhq/lisk-transactions';
import * as fa from 'react-icons/fa';
import { RPC_ENDPOINT, URL } from '../const';

class User extends Component {
  constructor(props){
    super(props);
    this.state = {
      status: 0,
      account: {
        type: "",
        id: "",
        address: "",
        balance: "",
        url: ""
      }
    }
    this.getUserInfo = this.getUserInfo.bind(this);
  }

  getUserInfo = async(e) => {
    this.setState({status: 0});
    let client = undefined;
    try {
      // ---------------------------
      // URLからIDを取得
      // ---------------------------
      const userid = this.props.match.params.userid;
      if (!userid || userid.split("-").length !== 2) {
        this.setState({status: 1});
        return;
      }
      const type = userid.split("-")[0];
      const id = userid.split("-")[1];

      client = await createWSClient(RPC_ENDPOINT);

      // ---------------------------
      // リンク済みアカウントを取得
      // ---------------------------
      const account = {
        type: "",
        id: "",
        address: "",
        balance: ""
      }
      const linkAccounts = await client.invoke("tiplsk:linkAccount");
      let linkAccount;
      if (linkAccounts && linkAccounts.link) linkAccount = linkAccounts.link.find(v => v.type === type && v.id === id);
      if (!linkAccount) {
        this.setState({status: 1});
        return;
      }
      account.type = linkAccount.type;
      account.id = linkAccount.id;
      account.address = getBase32AddressFromAddress(hexToBuffer(linkAccount.address), "tip");

      // ---------------------------
      // アカウントを取得
      // ---------------------------
      const data = await client.account.get(getAddressFromBase32Address(account.address, "tip"));
      if (!data) {
        this.setState({visible: false});
        return;
      }
      account.balance = convertBeddowsToLSK(data.token.balance.toString());

      // ---------------------------
      // プロフィールURLを取得
      // ---------------------------
      const url = URL.find(v => v.type === type);
      account.url = url.prof + account.id;

      this.setState({status: 2, account: account});

    } finally {
      if (client) client.disconnect();
    }
  }

  componentDidMount = async() => {
    this.getUserInfo();
  }

  render = () => {
    return (
      <div>
        {this.state.status === 0 &&
          <div>アカウント情報検索中。。。</div>
        }
        {this.state.status === 1 &&
          <div>アカウント情報が取得できませんでした。</div>
        }
        {this.state.status === 2 &&
          <div>
            <div>
              Type：{this.state.account.type}
            </div>
            <div>
              {this.state.account.url?
                <span>ID：<a href={this.state.account.url} target="_" className="link2">{this.state.account.id}</a>&nbsp;<fa.FaLink /></span>
                :
                <span>ID：{this.state.account.id}</span>
              }
            </div>
            <div>
              Address：{this.state.account.type}
            </div>
            <div>
              Balance：{this.state.account.balance}&nbsp;TLSK
            </div>
            <div>
              URL：{this.state.account.type}
            </div>
          </div>
        }
        <button onClick={this.getUserInfo}>再チェック</button>
      </div>
    );
  }
}

export default User;