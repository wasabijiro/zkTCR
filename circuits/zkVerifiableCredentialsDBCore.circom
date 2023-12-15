// circuits/zkVerifiableCredentialsDBCore.circom
pragma circom 2.0.0;

include "./../node_modules/circomlib/circuits/poseidon.circom";
include "./../node_modules/circomlib/circuits/comparators.circom";
include "./MerkleTreeInAlreadyHashed.circom";
include "./../node_modules/circomlib/circuits/mux1.circom";

template zkVerifiableCredentialsDBCore(depth, claimsN){
    //n: numbers of claims in the credential schema
    //Depth**2: numbers of leaves
    //Signals
    signal input ClaimsVals[claimsN];
    signal input MerkleProofSiblings[depth];
    signal input MerkleProofPathIndices[depth];
    signal input MerkleProofRoot;
    signal input EthAddress;
    signal input DisclosureVector[claimsN];
    signal output RevealedData[claimsN];

    //Hashing ClaimsVal to obtain CredentialHash (digest of posHash(claimsN-1))
    // leaf node に相当するハッシュ値を格納する配列
    component posHash[claimsN];

    log("circuit start");

    // 2つの入力を取るPoseidonハッシュ関数
    posHash[0] = Poseidon(2);
    // 最初の2つのクレーム（ClaimsVals[0] と ClaimsVals[1]）を取り、それらをPoseidonハッシュ関数の入力として設定
    posHash[0].inputs[0] <== ClaimsVals[0];
    posHash[0].inputs[1] <== ClaimsVals[1];

    for(var i=2; i<claimsN; i++){
        posHash[i-1] = Poseidon(2);
        // 前のハッシュの出力（posHash[i-2].out）と次のクレーム（ClaimsVals[i]）を新しいハッシュ関数の入力として設定
        posHash[i-1].inputs[0] <== posHash[i-2].out;
        posHash[i-1].inputs[1] <== ClaimsVals[i];
    }

    //Hashing EthAddress with CredentialHash to obtain the leaf
    posHash[claimsN-1] = Poseidon(2);
    // 最後のクレームのハッシュ（posHash[claimsN-2].out）とユーザーのイーサリアムアドレス（EthAddress）を取り、それらをハッシュ関数の入力として設定
    posHash[claimsN-1].inputs[0] <== posHash[claimsN-2].out;
    posHash[claimsN-1].inputs[1] <== EthAddress;

    log("leaf hash", posHash[claimsN-1].out);

    //Compute Merkle Root
    component  merkleProof = MerkleTreeInclusionProof(depth);
    // 計算した資格情報のハッシュ値（leaf）をメルクル証明コンポーネントの入力として設定
    merkleProof.leafHash <== posHash[claimsN-1].out;
    for(var i=0; i<depth; i++){
        merkleProof.path_elements[i] <== MerkleProofSiblings[i];
        merkleProof.path_index[i] <== MerkleProofPathIndices[i];
    }

    //Check Root equality
    // 提供されたマークル証明が有効であることを確認
    component ie = IsEqual();
    ie.in[0] <== merkleProof.root;
    ie.in[1] <== MerkleProofRoot;
    ie.out === 1;

    //Apply selective disclosure
    // Mux1は、2つの入力値（c[0]とc[1]）と1つの選択信号（s）を受け取り、選択信号に基づいてどちらかの入力値を出力
    component mux[claimsN];
    for(var i=0; i<claimsN; i++){
        mux[i] = Mux1();
        mux[i].c[0] <== 0;
        mux[i].c[1] <== ClaimsVals[i];
        mux[i].s <== DisclosureVector[i];
        RevealedData[i] <== mux[i].out;
    }

}

//set tree depth and credential claims number
component main {public [MerkleProofRoot,EthAddress,DisclosureVector]} = zkVerifiableCredentialsDBCore(16, 5);
