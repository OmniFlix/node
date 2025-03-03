import { DataItem, IRuntime, Node, sha256 } from '@kyve/core';
import { name, version } from '../package.json';
import { fetchBlock } from './utils';

export default class Celo implements IRuntime {
  public name = name;
  public version = version;

  public async getDataItem(core: Node, key: string): Promise<DataItem> {
    let block;

    try {
      block = await fetchBlock(core.poolConfig.rpc, +key);
    } catch (err) {
      throw err;
    }

    if (!block) throw new Error();

    return { key, value: block };
  }

  async validate(
    core: Node,
    uploadedBundle: DataItem[],
    validationBundle: DataItem[]
  ) {
    const uploadedBundleHash = sha256(
      Buffer.from(JSON.stringify(uploadedBundle))
    );
    const validationBundleHash = sha256(
      Buffer.from(JSON.stringify(validationBundle))
    );

    core.logger.debug(`Validating bundle proposal by hash`);
    core.logger.debug(`Uploaded:     ${uploadedBundleHash}`);
    core.logger.debug(`Validation:   ${validationBundleHash}\n`);

    return uploadedBundleHash === validationBundleHash;
  }

  public async getNextKey(key: string): Promise<string> {
    return (parseInt(key) + 1).toString();
  }

  public async formatValue(value: any): Promise<string> {
    return value.hash;
  }
}
