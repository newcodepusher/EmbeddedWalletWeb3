import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View} from 'react-native';
import {useCallback, useEffect, useState} from "react";
import Web3 from "web3";

const erc20Abi = require("./ERC20.json");
// const erc20Abi = {};

export default function App() {
    const [ethBalance, setEthBalance] = useState(0);
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [privateKey, setPrivateKey] = useState("0xb6126d48187e411451515153032053e3c1385798ddb65d5db6b6f105d470563d");
    const [targetTokenBalance, setTargetTokenBalance] = useState(0);
    const [token, setToken] = useState(null);

    const updateInfo = useCallback(() => {
        console.log("update balances");
        // console.log("web3", web3);
        console.log("erc20Abi", erc20Abi);
        if (!web3)
            return;
        web3.eth.getBalance(account.address).then((bal) => {
            setEthBalance(bal);
        });
        console.log("update balances");
        const token = new web3.eth.Contract(erc20Abi.abi, "0x5FfbaC75EFc9547FBc822166feD19B05Cd5890bb");
        setToken(token);
        token.methods.balanceOf("0x651c415942Afd69FF9b93822ea967298708EAe76").call().then((bal) => {
            setTargetTokenBalance(bal);
        });
    }, []);

    useEffect(() => {
        updateInfo();
    }, [account]);

    const init = useCallback(() => {
        console.log("init web3");
        const web3Instance = new Web3("https://goerli.infura.io/v3/33beb15f6748419fbb8b16ddf1420b31");
        setWeb3(web3Instance);
        const acc = web3Instance.eth.accounts.privateKeyToAccount(privateKey);
        setAccount(acc);
    }, []);

    useEffect(() => {
        init();
    }, []);

    return (
        <View style={styles.container}>
            <Text>Embedded web3 wallet</Text>
            <Text>My account: {account.address}</Text>
            <Text>My balance: {ethBalance} ETH</Text>
            <Text>Token balance: {targetTokenBalance}</Text>
            <StatusBar style="auto"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
