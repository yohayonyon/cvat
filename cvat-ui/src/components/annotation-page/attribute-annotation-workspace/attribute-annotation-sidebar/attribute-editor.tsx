// Copyright (C) 2020 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { GlobalHotKeys, KeyMap } from 'react-hotkeys';
import Text from 'antd/lib/typography/Text';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Select, { SelectValue } from 'antd/lib/select';
import Radio, { RadioChangeEvent } from 'antd/lib/radio';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';

interface InputElementParameters {
    attrID: number;
    inputType: string;
    values: string[];
    currentValue: string;
    onChange(value: string): void;
    ref: React.RefObject<Input | InputNumber>;
}

function renderInputElement(parameters: InputElementParameters): JSX.Element {
    const {
        inputType,
        attrID,
        values,
        currentValue,
        onChange,
        ref,
    } = parameters;

    const renderCheckbox = (): JSX.Element => (
        <>
            <Text strong>Checkbox: </Text>
            <div className='attribute-annotation-sidebar-attr-elem-wrapper'>
                <Checkbox
                    onChange={(event: CheckboxChangeEvent): void => (
                        onChange(event.target.checked ? 'true' : 'false')
                    )}
                    checked={currentValue === 'true'}
                />
            </div>
        </>
    );

    const renderSelect = (): JSX.Element => (
        <>
            <Text strong>Values: </Text>
            <div className='attribute-annotation-sidebar-attr-elem-wrapper'>
                <Select
                    value={currentValue}
                    style={{ width: '80%' }}
                    onChange={(value: SelectValue) => (
                        onChange(value as string)
                    )}
                >
                    {values.map((value: string): JSX.Element => (
                        <Select.Option key={value} value={value}>{value}</Select.Option>
                    ))}
                </Select>
            </div>
        </>
    );

    const renderRadio = (): JSX.Element => (
        <>
            <Text strong>Values: </Text>
            <div className='attribute-annotation-sidebar-attr-elem-wrapper'>
                <Radio.Group
                    value={currentValue}
                    onChange={(event: RadioChangeEvent) => (
                        onChange(event.target.value)
                    )}
                >
                    {values.map((value: string): JSX.Element => (
                        <Radio style={{ display: 'block' }} key={value} value={value}>{value}</Radio>
                    ))}
                </Radio.Group>
            </div>
        </>
    );

    const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft',
            'ArrowRight', 'Tab', 'Shift', 'Control']
            .includes(event.key)
        ) {
            event.preventDefault();
            const copyEvent = new KeyboardEvent('keydown', event);
            window.document.dispatchEvent(copyEvent);
        }
    };

    const renderText = (): JSX.Element => (
        <>
            {inputType === 'number' ? <Text strong>Number: </Text> : <Text strong>Text: </Text>}
            <div className='attribute-annotation-sidebar-attr-elem-wrapper'>
                <Input
                    autoFocus
                    key={attrID}
                    defaultValue={currentValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const { value } = event.target;
                        if (inputType === 'number') {
                            if (value !== '') {
                                const numberValue = +value;
                                if (!Number.isNaN(numberValue)) {
                                    onChange(`${numberValue}`);
                                }
                            }
                        } else {
                            onChange(value);
                        }
                    }}
                    onKeyDown={handleKeydown}
                    ref={ref as React.RefObject<Input>}
                />
            </div>
        </>
    );

    let element = null;
    if (inputType === 'checkbox') {
        element = renderCheckbox();
    } else if (inputType === 'select') {
        element = renderSelect();
    } else if (inputType === 'radio') {
        element = renderRadio();
    } else {
        element = renderText();
    }

    return (
        <div className='attribute-annotation-sidebar-attr-editor'>
            {element}
        </div>
    );
}

interface ListParameters {
    inputType: string;
    values: string[];
    onChange(value: string): void;
}

function renderList(parameters: ListParameters): JSX.Element | null {
    const { inputType, values, onChange } = parameters;

    if (inputType === 'checkbox') {
        const sortedValues = ['true', 'false'];
        if (values[0].toLowerCase() !== 'true') {
            sortedValues.reverse();
        }

        const keyMap: KeyMap = {};
        const handlers: {
            [key: string]: (keyEvent?: KeyboardEvent) => void;
        } = {};

        sortedValues.forEach((value: string, index: number): void => {
            const key = `SET_${index}_VALUE`;
            keyMap[key] = {
                name: `Set value "${value}"`,
                description: `Change current value for the attribute to "${value}"`,
                sequence: `${index}`,
                action: 'keydown',
            };

            handlers[key] = (event: KeyboardEvent | undefined) => {
                if (event) {
                    event.preventDefault();
                }

                onChange(value);
            };
        });

        return (
            <div className='attribute-annotation-sidebar-attr-list-wrapper'>
                <GlobalHotKeys keyMap={keyMap as KeyMap} handlers={handlers} allowChanges />
                <div>
                    <Text strong>0:</Text>
                    <Text>{` ${sortedValues[0]}`}</Text>
                </div>
                <div>
                    <Text strong>1:</Text>
                    <Text>{` ${sortedValues[1]}`}</Text>
                </div>
            </div>
        );
    }

    if (inputType === 'radio' || inputType === 'select') {
        const keyMap: KeyMap = {};
        const handlers: {
            [key: string]: (keyEvent?: KeyboardEvent) => void;
        } = {};

        values.slice(0, 9).forEach((value: string, index: number): void => {
            const key = `SET_${index}_VALUE`;
            keyMap[key] = {
                name: `Set value "${value}"`,
                description: `Change current value for the attribute to "${value}"`,
                sequence: `${index}`,
                action: 'keydown',
            };

            handlers[key] = (event: KeyboardEvent | undefined) => {
                if (event) {
                    event.preventDefault();
                }

                onChange(value);
            };
        });

        return (
            <div className='attribute-annotation-sidebar-attr-list-wrapper'>
                <GlobalHotKeys keyMap={keyMap as KeyMap} handlers={handlers} allowChanges />
                {values.map((value: string, index: number): JSX.Element => (
                    <div key={value}>
                        <Text strong>{`${index}:`}</Text>
                        <Text>{` ${value}`}</Text>
                    </div>
                ))}
            </div>
        );
    }

    if (inputType === 'number') {
        return (
            <div className='attribute-annotation-sidebar-attr-list-wrapper'>
                <div>
                    <Text strong>From:</Text>
                    <Text>{` ${values[0]}`}</Text>
                </div>
                <div>
                    <Text strong>To:</Text>
                    <Text>{` ${values[1]}`}</Text>
                </div>
                <div>
                    <Text strong>Step:</Text>
                    <Text>{` ${values[2]}`}</Text>
                </div>
            </div>
        );
    }

    return null;
}

interface Props {
    attribute: any;
    currentValue: string;
    onChange(value: string): void;
}

function AttributeEditor(props: Props): JSX.Element {
    const { attribute, currentValue, onChange } = props;
    const { inputType, values, id: attrID } = attribute;
    const ref = inputType === 'number' ? React.createRef<InputNumber>()
        : React.createRef<Input>();

    return (
        <div>
            {renderList({ values, inputType, onChange })}
            <hr />
            {renderInputElement({
                attrID,
                ref,
                inputType,
                currentValue,
                values,
                onChange,
            })}
        </div>
    );
}

export default React.memo(AttributeEditor);
