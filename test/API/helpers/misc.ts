type ReplacePropInType<Type extends object, PropName extends keyof Type, NewType> = Omit<Type, PropName> & {
    [key in PropName]: NewType
};

type ArrayifyPropInType<Type extends object, PropName extends keyof Type> = ReplacePropInType<Type, PropName, ReadonlyArray<Type[PropName]>>;

/*
  Input example: {
    prop1: 1, prop2: "2", prop3: [ "val1", "val2", "val3" ]
  }

  Expected output: [
    { prop1: 1, prop2: "2", prop3: "val1" },
    { prop1: 1, prop2: "2", prop3: "val2" },
    { prop1: 1, prop2: "2", prop3: "val3" }
  ]
*/
export function multiplyProperty<Type extends object, Prop extends keyof Type>(input: ArrayifyPropInType<Type, Prop>, propToMultiply: Prop): Array<Type>
{
    return input[propToMultiply].map((value: Type[Prop]) => ({
        // input.propToMultiply will be overwritten by the next line, so it's type safe
        ...input as Type,
        [propToMultiply]: value
    }));
}
