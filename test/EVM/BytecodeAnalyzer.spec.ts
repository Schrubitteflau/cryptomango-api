
import { ContractBytecode } from "@Util/TypeUtils/EVM";
import { BytecodeAnalyzer, ContractTypeOrUnknown } from "@EVM/BytecodeAnalyzer";

import * as helpers from "./BytecodeAnalyzerTestingHelpers";
import type { FormattedContractsData } from "./BytecodeAnalyzerTestingHelpers";


const testCases: FormattedContractsData = helpers.getTestCases();

describe.each(testCases)("Test BytecodeAnalyzer.ts with $expectedType at $address", ({ address, expectedType }) =>
{
    let bytecodeAnalyzer: BytecodeAnalyzer;
    let bytecode: ContractBytecode;

    beforeEach(async () =>
    {
        bytecode = await helpers.getContractBytecode(address);
        bytecodeAnalyzer = new BytecodeAnalyzer(bytecode);
    });

    test(`Contract at ${address} should be resolved as ${expectedType} type`, () =>
    {
        const determinedType: ContractTypeOrUnknown = bytecodeAnalyzer.determineContractType();
        expect(determinedType).toBe(expectedType);
    })
});
