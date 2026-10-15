import ResultadosClient from './ResultadosClient'

interface Props {
    searchParams: { origen: string; destino: string; fecha: string }
}

export default function ResultadosPage({ searchParams }: Props) {
    return (
        <ResultadosClient
            viajes={[]}
            origen={searchParams.origen || 'SPS'}
            destino={searchParams.destino || 'TGU'}
            fecha={searchParams.fecha || new Date().toISOString().split('T')[0]}
        />
    )
}