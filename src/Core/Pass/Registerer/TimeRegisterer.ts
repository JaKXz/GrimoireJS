import NamedValue from "../../../Base/NamedValue";
import RegistererBase from "./RegistererBase";
import Vector4 from "../../../Math/Vector4";
import ProgramWrapper from "../../Resources/Program/ProgramWrapper";
import IVariableDescription from "../../ProgramTransformer/Base/IVariableDescription";
import IApplyMaterialArgument from "../../Materials/IApplyMaterialArgument";
import Timer from "../../Timer";

class TimeRegisterer extends RegistererBase {

  public getName(): string {
    return "builtin.time";
  }

  public register(gl: WebGLRenderingContext, pWrapper: ProgramWrapper, matArg: IApplyMaterialArgument, uniforms: NamedValue<IVariableDescription>): void {
    if (uniforms["_Time"]) {
      if (uniforms["_Time"].variableType === "float") {
        pWrapper.uniformFloat("_Time", Timer.time);
      } else if (uniforms["_Time"].variableType === "vec4") {
        const time = Timer.time;
        pWrapper.uniformVector("_Time", new Vector4(time / 20, time, time * 2, time * 3));
      }
    }
    if (uniforms["_SinTime"]) {
      if (uniforms["_SinTime"].variableType === "float") {
        pWrapper.uniformFloat("_SinTime", Math.sin(Timer.time));
      } else if (uniforms["_SinTime"].variableType === "vec4") {
        const time = Timer.time;
        pWrapper.uniformVector("_SinTime", new Vector4(Math.sin(time / 8), Math.sin(time / 4), Math.sin(time / 2), Math.sin(time)));
      }
    }
    if (uniforms["_CosTime"]) {
      if (uniforms["_CosTime"].variableType === "float") {
        const time = Timer.time;
        pWrapper.uniformFloat("_CosTime", Math.cos(time));
      } else if (uniforms["_CosTime"].variableType === "vec4") {
        const time = Timer.time;
        pWrapper.uniformVector("_CosTime", new Vector4(Math.cos(time / 8), Math.cos(time / 4), Math.cos(time / 2), Math.cos(time)));
      }
    }
  }
}
export default TimeRegisterer;
