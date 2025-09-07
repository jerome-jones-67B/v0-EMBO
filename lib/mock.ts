export const mockLinkedData = [
  {
    type: "PDB",
    identifier: "7ABC",
    url: "https://www.rcsb.org/structure/7ABC",
    description: "Crystal structure of HSP70 complex",
  },
  {
    type: "UniProt",
    identifier: "P08107",
    url: "https://www.uniprot.org/uniprot/P08107",
    description: "Heat shock 70 kDa protein 1A",
  },
  {
    type: "GEO",
    identifier: "GSE123456",
    url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE123456",
    description: "RNA-seq data under oxidative stress",
  },
]

export const mockSourceData = [
  {
    filename: "supplementary_data.xlsx",
    url: "/files/supplementary_data.xlsx",
    description: "Supplementary data file",
    size: "1.2 MB",
    type: "xlsx",
  },
  {
    filename: "raw_data.csv",
    url: "/files/raw_data.csv",
    description: "Raw data file",
    size: "800 KB",
    type: "csv",
  },
]
