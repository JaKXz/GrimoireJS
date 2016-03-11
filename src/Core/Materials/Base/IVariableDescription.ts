interface IVariableAnnotation {
  default: any;
  [key: string]: any;
}
interface IVariableDescription {
  variableName: string;
  variableType: string;
  variablePrecision: string;
  variableAnnotation: IVariableAnnotation;
  isArray: boolean;
  arrayLength: number;
}
export default IVariableDescription;
