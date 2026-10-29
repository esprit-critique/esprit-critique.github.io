#!/bin/bash
# Télécharge dans cache/ les données dont generer_pays.py a besoin :
# Banque mondiale (dernière valeur disponible par pays, et agrégat « Monde ») et HCR (réfugiés, fin 2024).
set -e
cd "$(dirname "$0")"
mkdir -p cache
BM=https://api.worldbank.org/v2
INDICATEURS="SP.POP.TOTL AG.SRF.TOTL.K2 EN.POP.DNST SP.DYN.LE00.IN NY.GDP.PCAP.PP.CD SP.DYN.TFRT.IN SP.POP.65UP.TO.ZS
  SP.DYN.IMRT.IN IT.NET.USER.ZS AG.LND.FRST.ZS EN.GHG.CO2.PC.CE.AR5 SP.POP.GROW NY.GDP.MKTP.CD SL.UEM.TOTL.ZS
  BX.TRF.PWKR.DT.GD.ZS MS.MIL.XPND.GD.ZS MS.MIL.XPND.CD SG.GEN.PARL.ZS"
curl -sf -m 90 "$BM/country?format=json&per_page=400" -o cache/pays.json
curl -sf -m 90 "$BM/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000&date=2024" -o cache/pop2024.json
for code in $INDICATEURS; do
  echo "$code"
  curl -sf -m 90 "$BM/country/all/indicator/$code?format=json&per_page=20000&mrnev=1" -o "cache/$code.json"
  curl -sf -m 60 "$BM/country/WLD/indicator/$code?format=json&per_page=100&date=2015:2026" -o "cache/WLD_$code.json"
done
HCR=https://api.unhcr.org/population/v1/population/
curl -sf -m 90 "$HCR?limit=300&year=2024&coa_all=true" -o cache/hcr_asile.json
curl -sf -m 90 "$HCR?limit=300&year=2024&coo_all=true" -o cache/hcr_origine.json
echo "Terminé. Lancer ensuite : python3 generer_pays.py"
