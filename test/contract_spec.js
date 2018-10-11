const Lottery = embark.require('Embark/contracts/Lottery');
let accounts;

config({
  contracts: {
    "Lottery": {}
  }
}, (err, theAccounts) => {
  accounts = theAccounts;
});

describe("Lottery", function () {
  let LotteryInstance;

  before(async function() {
    LotteryInstance = await Lottery.deploy().send({from: accounts[0], gas: '1000000'});
  })

  it('deploys a contract', () => {
    assert.ok(LotteryInstance.options.address);
  })

  it('sends money to winner and resets the players array', async () => {
    await LotteryInstance.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('2', 'ether')
      });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await LotteryInstance.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    const players = await LotteryInstance.methods.getPlayers().call({
      from: accounts[0]
    });
    assert(difference > web3.utils.toWei('1.8', 'ether'));
    assert.equal(0, players.length);
  })

  it('allows one account to enter', async () => {
    await LotteryInstance.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    })

    const players = await LotteryInstance.methods.getPlayers().call({
      from: accounts[0]
    })

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  })

  it('allows multiple accounts to enter', async () => {
    await LotteryInstance.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    })

    await LotteryInstance.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    })

    const players = await LotteryInstance.methods.getPlayers().call({
      from: accounts[0]
    })

    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  })

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await LotteryInstance.methods.enter().send({
        from: accounts[0],
        value: 0
      })
      assert(false);
    } catch (err) {
      assert(err);
    }
  })

  it('only manager can call pickWinner', async () => {
    try {
      await LotteryInstance.methods.pickWinner().send({
        from: accounts[1]
      })
      assert(false);
    } catch (err) {
      assert(err);
    }
  })

});
