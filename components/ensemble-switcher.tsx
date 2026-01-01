import Dropdown from "@/components/dropdown";
import {useEnsembles} from "@/lib/hooks/use-ensembles";

export function EnsembleSwitcher({selectedEnsemble, setSelectedEnsemble, filterAdmin = false}: {
    selectedEnsemble: number | null;
    setSelectedEnsemble: (id: number | null) => void;
    filterAdmin?: boolean;
}) {
    const {ensembles} = useEnsembles();

    return (
        <Dropdown
            onChange={(value) => {
                setSelectedEnsemble(value ? parseInt(value) : null);
            }}
            placeholder="Select Ensemble"
            value={selectedEnsemble ? selectedEnsemble.toString() : undefined}
            valueText={ensembles.find(e => e.ensembles.id === selectedEnsemble)?.ensembles.name}
        >
            {ensembles.filter((ensemble) => {
                if (filterAdmin) {
                    return ensemble.role === 'admin';
                }
                return true;
            }).map(({ensembles: {id, name}}) => (
                <Dropdown.Item key={id} title={name} value={id.toString()}/>
            ))}
        </Dropdown>
    )
}