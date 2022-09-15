export function isPrimitiveValue(value: any): boolean {
    /* If the value is already an object (a non-primitive value), the constructor Object() will return
    this same value and the condition will be true. In the other case, Object() will create an object
    from this value, and the condition will be false :
        false  
        -> false
        
        Boolean(false) 
        -> false
        
        Object(false) 
        -> Boolean {false}

        false === false
        false === Boolean(false)
        false !== Object(false)
    */
    return value !== Object(value);
}
