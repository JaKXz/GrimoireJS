import Ensure from "../Base/Ensure";
import IAttributeDeclaration from "./IAttributeDeclaration";
import AttributeConverter from "./AttributeConverter";
import NamespacedIdentity from "../Base/NamespacedIdentity";
import GrimoireInterface from "../GrimoireInterface";
import Component from "./Component";

/**
 * Management a single attribute with specified type. Converter will serve a value with object with any type instead of string.
 * When attribute is changed, emit a "change" event. When attribute is requested, emit a "get" event.
 * If responsive flag is not true, event will not be emitted.
 */
class Attribute {

  public name: NamespacedIdentity;
  public declaration: IAttributeDeclaration;
  public converter: AttributeConverter;
  public component: Component;

  private _value: any;
  private _handlers: ((attr: Attribute) => void)[] = [];

  /**
   * Get a value with specified type.
   * @return {any} value with specified type.
   */
  public get Value(): any {
    return this._value;
  }

  /**
   * Construct a new attribute with name of key and any value with specified type. If constant flag is true, This attribute will be immutable.
   * If converter is not served, string converter will be set as default.
   * @param {string}        key       Key of this attribute.
   * @param {any}           value     Value of this attribute.
   * @param {ConverterBase} converter Converter of this attribute.
   * @param {boolean}       constant  Whether this attribute is immutable or not. False as default.
   */
  constructor(name: string, declaration: IAttributeDeclaration, component: Component) {
    this.name = new NamespacedIdentity(component.name.ns, name);
    this.declaration = declaration;
    const converterName = Ensure.ensureTobeNamespacedIdentity(declaration.converter);
    this.converter = GrimoireInterface.converters.get(converterName);
    if (!this.converter) {
      throw new Error(`Attribute converter '${converterName.fqn}' can not found`);
    }
    this.Value = declaration.defaultValue;
  }

  /**
   * Set a value with any type.
   * @param {any} val Value with string or specified type.
   */
  public set Value(val: any) {
    try {
      this._value = this.converter.convert(val);
    } catch (e) {
      console.error(e); // TODO should be more convenient error handling
    }
    this._notifyChange();
  }

  public addObserver(handler: (attr: Attribute) => void): void {
    this._handlers.push(handler);
  }

  public removeObserver(handler: (attr: Attribute) => void): void {
    let index = -1;
    for (let i = 0; i < this._handlers.length; i++) {
      if (handler === this._handlers[i]) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      return;
    }
    this._handlers.splice(index, 1);
  }

  private _notifyChange(): void {
    this._handlers.forEach((handler) => {
      handler(this);
    });
  }
}


export default Attribute;
