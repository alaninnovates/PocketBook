import DropdownComponent from './dropdown';
import DropdownItem from './dropdown-item';

type DropdownExport = typeof DropdownComponent & {
    Item: typeof DropdownItem;
};

const Dropdown: DropdownExport = Object.assign(
    // @component ./Dropdown.tsx
    DropdownComponent,
    {
        // @component ./DropdownItem.tsx
        Item: DropdownItem,
    }
);

export default Dropdown;