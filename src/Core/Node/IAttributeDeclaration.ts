import NSIdentity from "../Base/NSIdentity";
interface IAttributeDeclaration {
  converter: string | NSIdentity;
  defaultValue: any;
  readonly?: boolean;
  boundTo?: string;
  [parameters: string]: any;
}

export default IAttributeDeclaration;
