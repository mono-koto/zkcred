import { isReady, PrivateKey, shutdown } from 'snarkyjs';

async function main() {
  await isReady;
  const privateKey = PrivateKey.random();
  console.log('privateKey', privateKey.toBase58());
  const publicKey = privateKey.toPublicKey();
  console.log('publicKey', publicKey.toBase58());
  setTimeout(shutdown, 0);
}

main();
