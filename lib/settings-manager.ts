import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState} from "react";

export enum SettingsProperty {
    FieldView = 'fieldView',
    DotScale = 'dotScale',
}

export enum FieldView {
    Director = 'director',
    Performer = 'performer',
}

export class SettingsManager {
    static async getProperty<T>(key: SettingsProperty, defaultValue: T): Promise<T> {
        const value = await AsyncStorage.getItem(key);
        if (value === null) {
            return defaultValue;
        }
        return JSON.parse(value) as T;
    }

    static async setProperty<T>(key: SettingsProperty, value: T): Promise<void> {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    }
}

export const useProperty = <T,>(key: SettingsProperty, defaultValue: T): [T, (value: T) => Promise<void>] => {
    const [value, setValue] = useState<T>(defaultValue);

    useEffect(() => {
        const loadValue = async () => {
            const storedValue = await SettingsManager.getProperty<T>(key, defaultValue);
            setValue(storedValue);
        };
        loadValue();
    }, [key, defaultValue]);

    const updateValue = async (newValue: T) => {
        setValue(newValue);
        await SettingsManager.setProperty<T>(key, newValue);
    };

    return [value, updateValue];
}