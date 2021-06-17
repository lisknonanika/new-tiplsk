
import { Component } from 'react';
import { createWSClient } from '@liskhq/lisk-api-client';
import { getBase32AddressFromAddress } from '@liskhq/lisk-cryptography';
import { convertBeddowsToLSK } from '@liskhq/lisk-transactions';
import * as fa from 'react-icons/fa';
import { RPC_ENDPOINT, URL } from '../const';

class User extends Component {
  constructor(props){
    super(props);
    this.state = {
      account: {
        status: 0,
        type: "",
        id: "",
        address: "",
        balance: "",
        url: ""
      },
      pending: {
        status: 0
      }
    }
    this.getUserInfo = this.getUserInfo.bind(this);
    this.getPendingInfo = this.getPendingInfo.bind(this);
  }

  getUserInfo = async(e) => {
    const account = {status: 0, type: "", id: "", address: "", balance: ""}
    this.setState({account: account});
    let client = undefined;
    try {
      // ---------------------------
      // URLからIDを取得
      // ---------------------------
      const userid = this.props.match.params.userid;
      if (!userid || userid.split("-").length !== 2) {
        account.status = 1;
        this.setState({account: account});
        return;
      }
      const type = userid.split("-")[0];
      const id = userid.split("-")[1];

      client = await createWSClient(RPC_ENDPOINT);

      // find link account
      const linkAccounts = await client.invoke("tiplsk:linkAccount");
      let linkAccount;
      if (linkAccounts?.link) linkAccount = linkAccounts.link.find(v => v.type === type && v.id === id);

      // find pending account
      if (!linkAccount) {
        const pendingAccounts = await client.invoke("tiplsk:pendingTx");
        if (pendingAccounts?.tx) {
          const pendingAccount = pendingAccounts.tx.find(v => v.type === "registration" && v.content.type === type && v.content.senderId === id);
          if (pendingAccount) {
            linkAccount = {
              type: `${pendingAccount.content.type} (pending)`,
              id: pendingAccount.content.senderId,
              address: pendingAccount.content.address
            }
          }
        }
      }
      if (!linkAccount) {
        account.status = 1;
        this.setState({account: account});
        return;
      }
      account.type = linkAccount.type;
      account.id = linkAccount.id;
      account.address = getBase32AddressFromAddress(linkAccount.address.data, "tip");

      // ---------------------------
      // アカウントを取得
      // ---------------------------
      const data = await client.account.get(linkAccount.address);
      if (!data) {
        this.setState({visible: false});
        return;
      }
      account.balance = convertBeddowsToLSK(data.token.balance.toString());

      // ---------------------------
      // プロフィールURLを取得
      // ---------------------------
      const url = URL.find(v => v.type === type);
      account.url = url?url.prof + account.id: "";

      account.status = 2;
      this.setState({account: account});

      // ---------------------------
      // 保留中の情報を取得
      // ---------------------------
      this.getPendingInfo();

    } finally {
      if (client) client.disconnect();
    }
  }

  getPendingInfo = async(e) => {
    const pending = {status: 0}
    this.setState({pending: pending});
    let client = undefined;
    try {
      setTimeout(()=>{
        const pending = {status: 1}
        this.setState({pending: pending});
      }, 1000)
    } finally {
      if (client) client.disconnect();
    }
  }

  componentDidMount = async() => {
    this.getUserInfo();
  }

  render = () => {
    return (
      <div className="center">
        <div className="label">- Account -</div>
        {this.state.account.status === 0 &&
          <div className="note">アカウント情報検索中。。。</div>
        }
        {this.state.account.status === 1 &&
          <div className="note">アカウント情報が取得できませんでした。</div>
        }
        {this.state.account.status === 2 &&
          <div>
            <div className="note">
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
                Address：{this.state.account.address}
              </div>
              <div>
                Balance：{this.state.account.balance}&nbsp;TLSK
              </div>
            </div>
          </div>
        }
        <div className="note">
          <button onClick={this.getUserInfo}>Reload</button>
        </div>
        {this.state.account.status === 2 &&
          <div>
            <hr></hr>
            <div className="label">- Pending -</div>
            {this.state.pending.status === 0 &&
              <div className="note">保留中情報検索中。。。</div>
            }
            {this.state.pending.status === 1 &&
              <div className="note">保留中のトランザクションはありません。</div>
            }
            {this.state.pending.status === 2 &&
              <div className="note">保留中情報</div>
            }
            <div className="note">
              <button onClick={this.getPendingInfo}>Reload</button>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default User;