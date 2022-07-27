import { ICharacter, IBox } from './interfaces';

export function characterFromContract(id: number, metadataJson: any): ICharacter {
  const image = metadataJson.image;
  const rarity = metadataJson.attributes[0].value;
  return { id, image, rarity };
}

export function boxFromContract(id: number, metadataJson: any): IBox {
  const image = metadataJson.image;
  const rarity = metadataJson.attributes[0].value;
  return { id, image, rarity };
}
