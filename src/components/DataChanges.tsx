import { Diff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import {
  fetchGraphProperties,
  fetchMarketOptions,
} from "@/services/apiService";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

const defaultProperties = {
  modelljahrcode: "Modelljahr-Code",
  zulässige_dachlast_kg: "zulässige Dachlast (kg)",
  w103_fahrzeugbreite_mm: "W103 Fahrzeugbreite (mm)",
  separater_kühlkreislauf_nt_2_füllmenge_l:
    "Separater Kühlkreislauf NT 2 - Füllmenge (l)",
  kühlkreislauf_ht_vorhanden: "Kühlkreislauf HT vorhanden",
  kühlkreislauf_ht_füllmenge_mit_heizung_l:
    "Kühlkreislauf HT - Füllmenge mit Heizung (l)",
  for_market: "for market",
  separater_kühlkreislauf_nt_1_vorhanden:
    "Separater Kühlkreislauf NT 1 vorhanden",
  w145_breite_über_eingeklappte_außenspiegel_mm:
    "W145 Breite über eingeklappte Außenspiegel (mm)",
  kraftstoffbehälter_inhalt_inkl_reservemenge_l:
    "Kraftstoffbehälter - Inhalt inkl. Reservemenge (l)",
  baureihe_3: "Baureihe 3",
  l101_radstand_m1_ff_mm: "L101 Radstand (M1 ~ ff) (mm)",
  body_type_numerical: "Body type (numerical)",
  ölwechselmenge_mit_filter_l: "Ölwechselmenge mit Filter (l)",
  kraftstoffart: "Kraftstoffart",
  anhängelast_ungebremst_kg: "Anhängelast ungebremst (kg)",
  wattiefe_mm: "Wattiefe (mm)",
  ac_ladezeit_25100_soc_netto_mode_2_18kw_h:
    "AC Ladezeit 25%-100% SOC (netto) Mode 2 (1,8kW) (h)",
  fahrzeugbaumuster7: "Fahrzeugbaumuster-7",
  betriebsstoff_kältemittel_klimaanlage_alternativ:
    "Betriebsstoff Kältemittel Klimaanlage (Alternativ)",
  scheibenwischwasserbehälter_befüllmenge_l:
    "Scheibenwischwasserbehälter Befüllmenge (l)",
  angebotsmarkt: "Angebotsmarkt",
  h101_fahrzeughöhe_m1_ff_mm: "H101 Fahrzeughöhe (M1 ~ ff) (mm)",
  betriebsstoff_kältemittel_klimaanlage:
    "Betriebsstoff Kältemittel Klimaanlage",
  max_böschungswinkel_hinten_ff_nur_suv:
    "Max. Böschungswinkel hinten FF (nur SUV) (°)",
  mbblattnummer_benzinmotor: "MB-Blatt-Nummer (Benzinmotor)",
  anhängelast_gebremst_bei_12_kg: "Anhängelast gebremst (bei 12 %) (kg)",
  modelljahr: "Modelljahr",
  baumuster: "Baumuster",
  ac_ladezeit_0100_soc_netto_mode_2_18kw_h:
    "AC Ladezeit 0%-100% SOC (netto) Mode 2 (1,8kW) (h)",
  mbblattnummer_diesel_mit_dpf: "MB-Blatt-Nummer (Diesel mit DPF)",
  modelljahrart: "Modelljahr-Art",
  motor_typbezeichnung: "Motor - Typbezeichnung",
  h156ff_absolut_geringste_bodenfreiheit_m4_ffeg_weichteile_ausgenommen_mm:
    "H156ff Absolut geringste Bodenfreiheit (M4 ~ ff-EG) (Weichteile ausgenommen) (mm)",
  baureihe: "Baureihe",
  verkaufsbezeichnung: "Verkaufsbezeichnung",
  steigfähigkeit: "Steigfähigkeit (%)",
  l103_fahrzeuglänge_mm: "L103 Fahrzeuglänge (mm)",
  max_böschungswinkel_vorne_ff_nur_suv:
    "Max. Böschungswinkel vorne FF (nur SUV) (°)",
  max_ladeleistung_dc_kw: "Max. Ladeleistung DC (kW)",
  d102_kleinster_wendekreisdurchmesser_m1_ff_m:
    "D102 kleinster Wendekreisdurchmesser (M1 ~ ff) (m)",
  w144_breite_über_außenspiegel_mm: "W144 Breite über Außenspiegel (mm)",
  antriebsart: "Antriebsart",
  ausführung: "Ausführung",
  powertrainkonzept: "Powertrainkonzept",
  kraftstoffbehälter_reservemenge_l: "Kraftstoffbehälter - Reservemenge (l)",
  motorbaureihe: "Motorbaureihe",
  hvbatterie_energieinhalt_installiert_kwh:
    "HV-Batterie - Energieinhalt installiert (kWh)",
  amg: "AMG",
  karosserieform: "Karosserieform",
  dc_ladezeit_1080_soc_netto_min: "DC Ladezeit 10%-80% SOC (netto) (min)",
  ac_ladezeit_0100_soc_netto_mode_3_74kw_1phasig_h:
    "AC Ladezeit 0%-100% SOC (netto) Mode 3 (7,4kW, 1-phasig) (h)",
  h156gvm_absolut_geringste_bodenfreiheit_m3_zgg_weichteile_ausgenommen_mm:
    "H156-GVM Absolut geringste Bodenfreiheit (M3 ~ zGG) (Weichteile ausgenommen) (mm)",
  ac_ladeleistung_mode_3_kw: "AC Ladeleistung Mode 3 (kW)",
  h110_m1_ff_fahrzeughöhe_heckklappe_offen_mm:
    "H110 (M1 ff) Fahrzeughöhe Heckklappe offen (mm)",
  baureihe_4: "Baureihe 4",
  lenkungsposition: "Lenkungsposition",
  ac_ladezeit_0100_soc_netto_mode_3_h:
    "AC Ladezeit 0%-100% SOC (netto) Mode 3 (h)",
  h251_höhe_der_geöffneten_heckklappe_m1_ff_mm:
    "H251 Höhe der geöffneten Heckklappe (M1 ~ ff) (mm)",
  separater_kühlkreislauf_nt_1_füllmenge_l:
    "Separater Kühlkreislauf NT 1 - Füllmenge (l)",
  separater_kühlkreislauf_nt_2_vorhanden:
    "Separater Kühlkreislauf NT 2 vorhanden",
  l105ahk_überhanglänge_hinten_mit_anhängekupplung_und_schutzkappe_mm:
    "L105AHK Überhanglänge hinten mit Anhängekupplung und Schutzkappe (mm)",
  zulässige_stützlast_kg: "zulässige Stützlast (kg)",
  betriebsstoff_kompressoröl_klimaanlage:
    "Betriebsstoff Kompressoröl Klimaanlage",
  ac_ladeleistung_mode_2_kw: "AC Ladeleistung Mode 2 (kW)",
  inhalt_scrtank_l: "Inhalt SCR-Tank (l)",
  zulässige_achslast_hinterachse_hängerbetrieb_kg:
    "zulässige Achslast Hinterachse (Hängerbetrieb) (kg)",
  ac_ladezeit_0100_soc_netto_mode_2_37kw_h:
    "AC Ladezeit 0%-100% SOC (netto) Mode 2 (3,7kW) (h)",
  füllmenge_kompressoröl_klimaanlage_g:
    "Füllmenge Kompressoröl Klimaanlage (g)",
  mbblattnummer_diesel_ohne_dpf: "MB-Blatt-Nummer (Diesel ohne DPF)",
  füllmenge_kältemittel_klimaanlage_g: "Füllmenge Kältemittel Klimaanlage (g)",
  ac_ladezeit_25100_soc_netto_mode_2_h:
    "AC Ladezeit 25%-100% SOC (netto) Mode 2 (h)",
  ac_ladezeit_0100_soc_netto_mode_2_h:
    "AC Ladezeit 0%-100% SOC (netto) Mode 2 (h)",
};

const defaultMarket = ["ECE/ROW", "Japan", "TW", "USA/CND"];

export const DataChanges = () => {
  const { sessionId } = useSession();
  const { toast } = useToast();

  const [market, setMarket] = useState("");
  const [graphProperty, setGraphProperty] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [marketOptions, setMarketOptions] = useState<string[]>(defaultMarket);
  const [graphProperties, setGraphProperties] =
    useState<Record<string, string>>(defaultProperties);

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);

      try {
        // Fetch market options
        const marketsResponse = await fetchMarketOptions(sessionId);
        const propertiesResponse = await fetchGraphProperties(sessionId);

        if (marketsResponse.success && marketsResponse.data) {
          setMarketOptions(
            Array.isArray(marketsResponse.data) ? marketsResponse.data : []
          );
        }

        if (propertiesResponse.success && propertiesResponse.data) {
          // Make sure we're storing an object
          const props =
            typeof propertiesResponse.data === "object"
              ? propertiesResponse.data
              : {};
          setGraphProperties(props);
        }
      } catch (error) {
        toast({
          title: "Warning",
          description:
            "Failed to load options from server. Using default values.",
          variant: "destructive",
        });
        // Ensure we have valid default states in case of error
        setMarketOptions([]);
        setGraphProperties({});
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [toast, sessionId]);

  const handleSetGraphProperty = (value: string) => {
    setGraphProperty(value);
  };

  const handleSubmit = () => {
    if (!graphProperty || !market) {
      toast({
        title: "Error",
        description: "Please select both a graph property and a market.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically handle the submission logic, e.g., sending data to an API
    console.log("Submitting:", { graphProperty, market });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Diff className="h-5 w-5" />
          View changes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="graphProperty">Graph Property</Label>
              <Select
                value={graphProperty}
                onValueChange={(e) => handleSetGraphProperty(e)}
                disabled={isLoadingOptions}
              >
                <SelectTrigger id="graphProperty" className="w-full">
                  {isLoadingOptions ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select a graph property" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(graphProperties || {})?.length > 0 ? (
                    Object.entries(graphProperties || {}).map(
                      ([key, value]) => (
                        <SelectItem
                          key={key}
                          value={value}
                          className="focus:text-white cursor-pointer"
                        >
                          {value}
                        </SelectItem>
                      )
                    )
                  ) : (
                    <SelectItem value="no-properties" disabled>
                      No properties available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="market">Market</Label>
              <Select
                value={market}
                onValueChange={setMarket}
                disabled={isLoadingOptions}
              >
                <SelectTrigger id="market" className="w-full">
                  {isLoadingOptions ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select a market" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {marketOptions && marketOptions.length > 0 ? (
                    marketOptions.map((marketOption) => (
                      <SelectItem
                        key={marketOption}
                        value={marketOption}
                        className="focus:text-white cursor-pointer"
                      >
                        {marketOption}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-markets" disabled>
                      No markets available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="maker">Maker</Label>
            <Select
              value={market}
              onValueChange={setMarket}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="maker" className="w-full">
                {isLoadingOptions ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a market" />
                )}
              </SelectTrigger>
              <SelectContent>
                {marketOptions && marketOptions.length > 0 ? (
                  marketOptions.map((marketOption) => (
                    <SelectItem
                      key={marketOption}
                      value={marketOption}
                      className="focus:text-white cursor-pointer"
                    >
                      {marketOption}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-markets" disabled>
                    No markets available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-fit self-end" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
