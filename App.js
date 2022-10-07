import * as React from 'react';
import {StyleSheet, Text, View, ScrollView, TextInput, Button, AsyncStorage, Clipboard} from 'react-native';
import {useEffect, useState} from "react";
import Web3 from "web3";
import ModalDropdown from 'react-native-modal-dropdown';
import HDWallet from 'ethereum-hdwallet';

const erc20Abi = require("./ERC20.json");

export default function App() {
    const rpcUrl = "https://goerli.infura.io/v3/33beb15f6748419fbb8b16ddf1420b31";
    const [ethBalance, setEthBalance] = useState(0);
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [accountPrivateKey, setAccountPrivateKey] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [privateKeys, setPrivateKeys] = useState([]);
    const [myTokenBalance, setMyTokenBalance] = useState(0);
    const [token, setToken] = useState(null);
    const [mnemonic, setMnemonic] = useState("");
    const [privateKeyInput, setPrivateKeyInput] = useState("");
    const [addressForBalanceOf, setAddressForBalanceOf] = useState("");
    const [balanceOf, setBalanceOf] = useState("");
    const [addressForTransferToken, setAddressForTransferToken] = useState("");
    const [transferTokenAmount, setTransferTokenAmount] = useState(0);
    const [transferTokenResult, setTransferTokenResult] = useState("");

    const prepareInfo = () => {
        return {
            token: token._address,
            privateKeys,
            addresses,
            rpc: rpcUrl,
        };
    };

    const saveData = () => {
        AsyncStorage.setItem('jsondata', JSON.stringify(prepareInfo()));
    };

    const loadData = async () => {
        const dataString = await AsyncStorage.getItem('jsondata');
        if (!!dataString && dataString.length) {
            const jsonData = JSON.parse(dataString);
            setAddresses(jsonData.addresses);
            setPrivateKeys(jsonData.privateKeys);
        }
    };

    const updateInfo = () => {
        if (!!web3) {
            web3.eth.getBalance(account.address).then((balance) => {
                setEthBalance(balance);
            });
            if (!!token && !!account) {
                token.methods.balanceOf(account.address).call().then((bal) => {
                    setMyTokenBalance(bal);
                });
            }
        }
    };

    const updateBalanceOf = () => {
        if (!!web3) {
            if (!!token && !!addressForBalanceOf) {
                setBalanceOf("pending");
                token.methods.balanceOf(addressForBalanceOf).call().then((bal) => {
                    setBalanceOf(bal);
                }).catch(() => {
                    setBalanceOf("error");
                });
            }
        }
    };

    const transferToken = () => {
        if (!!web3) {
            if (!!token && !!addressForTransferToken && !!transferTokenAmount) {
                setTransferTokenResult("pending");
                const tx = token.methods.transfer(addressForTransferToken, transferTokenAmount)
                    .encodeABI({
                        from: account.address,
                        gas: 1500000,
                        gasPrice: '10000000000000'
                    }).catch((err) => {
                        console.log(err);
                        setTransferTokenResult("error");
                    });
                console.log(":tx", tx);
                const signedTx = web3.eth.accounts.signTransaction(tx, accountPrivateKey).catch((err) => {
                    console.log(err);
                    setTransferTokenResult("error");
                });
                console.log(":signedTx", signedTx);
                web3.eth.sendTransaction(signedTx).then((bal) => {
                    setTransferTokenResult("ok");
                }).catch((err) => {
                    console.log(err);
                    setTransferTokenResult("error");
                });
            }
        }
    };

    useEffect(() => {
        updateInfo();
    }, [account]);


    const createAccount = (privateKey) => {
        const acc = web3.eth.accounts.privateKeyToAccount(privateKey);
        setAddresses([...addresses, acc.address]);
        setPrivateKeys([...privateKeys, privateKey]);
        saveData();
    };

    const createRandomKey = () => {
        createAccount(web3.utils.randomHex(32));
    };

    const createFromMnemonic = async () => {
        const hdwallet = HDWallet.fromMnemonic(mnemonic);
        const privateKey = `0x${hdwallet.derive(`m/44'/60'/0'/0/0`).getPrivateKey().toString('hex')}`;
        createAccount(privateKey);
    };

    const createFromPrivateKey = () => {
        createAccount(privateKeyInput);
    };

    const init = () => {
        console.log("init web3");
        const web3Instance = new Web3(rpcUrl);
        setWeb3(web3Instance);
        const tokenInstance = new web3Instance.eth.Contract(erc20Abi.abi, "0x1fFE9c7110Bb3A07463bE5EBA80BD40F03EB3e3e");
        setToken(tokenInstance);
        loadData().catch(console.error);
    };

    useEffect(() => {
        init();
    }, []);

    const copyAll = () => {
        Clipboard.setString(JSON.stringify(prepareInfo(), null, 4));
    };

    const selectAccount = (index, address) => {
        setAccountPrivateKey(privateKeys[index]);
        const acc = web3.eth.accounts.privateKeyToAccount(privateKeys[index]);
        setAccount(acc);
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text>Embedded web3 wallet</Text>
                <Text/>
                <Button
                    onPress={copyAll}
                    title="Copy token address, private keys, addresses to clipboard"
                    color="#841584"
                />

                <Text/>

                <Button
                    onPress={createRandomKey}
                    title="Create random"
                />

                <Text>Mnemonic:</Text>
                <TextInput style={styles.textInput} onChangeText={setMnemonic} defaultValue={mnemonic}/>
                <Button
                    onPress={createFromMnemonic}
                    title="Import mnemonic"
                />
                <Text>Private key:</Text>
                <TextInput style={styles.textInput} onChangeText={setPrivateKeyInput} defaultValue={privateKeyInput}/>
                <Button
                    onPress={createFromPrivateKey}
                    title="Import private key"
                />

                <Text>Select account:</Text>
                <ModalDropdown style={styles.dropDown} options={addresses} onSelect={selectAccount}/>
                <Text>My balance: {ethBalance} wei</Text>

                <Text/>
                <Text>Token: {token ? token._address : ""}</Text>
                <Text/>

                <Button
                    onPress={() => {
                    }}
                    title="Mint 1000 tokens to me"
                />
                <Text>My token balance: {myTokenBalance}</Text>

                <Text/>

                <Text>Balance of:</Text>
                <TextInput style={styles.textInput} onChangeText={setAddressForBalanceOf}
                           defaultValue={addressForBalanceOf}/>
                <Button
                    onPress={updateBalanceOf}
                    title="Update"
                />
                <Text>balance: {balanceOf}</Text>

                <Text/>

                <Text>Transfer token to address:</Text>
                <TextInput style={styles.textInput} onChangeText={setAddressForTransferToken}
                           defaultValue={addressForTransferToken}/>
                <Text>Amount:</Text>
                <TextInput style={styles.textInput} onChangeText={setTransferTokenAmount}
                           defaultValue={transferTokenAmount}/>
                <Button
                    onPress={transferToken}
                    title="Transfer token"
                />
                <Text>State: {transferTokenResult}</Text>

                <Text/>

                <Text>Transfer eth to address:</Text>
                <TextInput style={styles.textInput}/>
                <Text>Amount:</Text>
                <TextInput style={styles.textInput}/>
                <Button
                    onPress={() => {
                    }}
                    title="Transfer eth"
                />
                <Text>Result</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    textInput: {
        borderColor: "#000",
        borderWidth: 1,
        height: 40,
        width: 300,
        padding: 10
    },
    dropDown: {
        height: 40,
        backgroundColor: "#ccc",
    }
});
