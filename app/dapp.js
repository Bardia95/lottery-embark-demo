import React from 'react';
import ReactDOM from 'react-dom';
import EmbarkJS from 'Embark/EmbarkJS';
import Lottery from 'Embark/contracts/Lottery';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      manager: '',
      players: [],
      balance: '',
      value: '',
      message: '',
      error: null
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onClick = this.onClick.bind(this);

  }
  componentDidMount() {
    EmbarkJS.onReady((err) => {
      if (err) {
        return this.setState({error: err.message || err});
      }
      Lottery.methods.manager().call().then(_manager => this.setState({ manager: _manager }));
      Lottery.methods.getPlayers().call().then(_players => this.setState({ players: _players }));
      web3.eth.getBalance(Lottery.address).then(_balance => this.setState({ balance: _balance }));
    });
  }

  onSubmit(e) {
    e.preventDefault();

    this.setState({ message: 'Waiting on transaction success... '})

    Lottery.methods.enter().send({
      from: web3.eth.defaultAccount,
      value: web3.utils.toWei(this.state.value, 'ether'),
      gas: 4 *1000 * 1000
    }).then(() => this.setState({ message: "You've been entered"}))

  }

  onClick() {
    var accounts;
    this.setState({ message: 'Picking a winner...'})
    Lottery.methods.pickWinner().send({
      from: web3.eth.defaultAccount,
      gas: 4 *1000 * 1000
    }).then(() => {
      this.setState({ message: "A winner has been picked! "})
    })
  }


  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}.</p>
        <p>
          There are currently {this.state.players.length} people entered,
          competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={e => this.setState({ value: e.target.value })}
            />
            <button>Enter</button>
          </div>
        </form>

        <hr />

        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick Winner!</button>

        <hr />

        <div>
          {this.state.message}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));
