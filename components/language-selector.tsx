'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

export const languageOptions = [
  {
    value: 'ace_Arab',
    label: 'Achinese (Arabic script)'
  },
  {
    value: 'ace_Latn',
    label: 'Achinese (Latin script)'
  },
  {
    value: 'acm_Arab',
    label: 'Iraqi Arabic (Arabic script)'
  },
  {
    value: 'acq_Arab',
    label: "Ta'izzi-Adeni Arabic (Arabic script)"
  },
  {
    value: 'aeb_Arab',
    label: 'Tunisian Arabic (Arabic script)'
  },
  {
    value: 'afr_Latn',
    label: 'Afrikaans'
  },
  {
    value: 'ajp_Arab',
    label: 'South Levantine Arabic (Arabic script)'
  },
  {
    value: 'aka_Latn',
    label: 'Akan'
  },
  {
    value: 'amh_Ethi',
    label: 'Amharic'
  },
  {
    value: 'apc_Arab',
    label: 'North Levantine Arabic (Arabic script)'
  },
  {
    value: 'arb_Arab',
    label: 'Standard Arabic (Arabic script)'
  },
  {
    value: 'ars_Arab',
    label: 'Najdi Arabic (Arabic script)'
  },
  {
    value: 'ary_Arab',
    label: 'Moroccan Arabic (Arabic script)'
  },
  {
    value: 'arz_Arab',
    label: 'Egyptian Arabic (Arabic script)'
  },
  {
    value: 'ast_Latn',
    label: 'Asturian'
  },
  {
    value: 'awa_Deva',
    label: 'Awadhi (Devanagari script)'
  },
  {
    value: 'ayr_Latn',
    label: 'Aymara'
  },
  {
    value: 'azb_Arab',
    label: 'South Azerbaijani (Arabic script)'
  },
  {
    value: 'azj_Latn',
    label: 'North Azerbaijani (Latin script)'
  },
  {
    value: 'bak_Cyrl',
    label: 'Bashkir (Cyrillic script)'
  },
  {
    value: 'bam_Latn',
    label: 'Bambara'
  },
  {
    value: 'ban_Latn',
    label: 'Balinese'
  },
  {
    value: 'bel_Cyrl',
    label: 'Belarusian (Cyrillic script)'
  },
  {
    value: 'bem_Latn',
    label: 'Bemba'
  },
  {
    value: 'ben_Beng',
    label: 'Bengali'
  },
  {
    value: 'bho_Deva',
    label: 'Bhojpuri (Devanagari script)'
  },
  {
    value: 'bjn_Arab',
    label: 'Banjar (Arabic script)'
  },
  {
    value: 'bjn_Latn',
    label: 'Banjar (Latin script)'
  },
  {
    value: 'bod_Tibt',
    label: 'Tibetan'
  },
  {
    value: 'bos_Latn',
    label: 'Bosnian (Latin script)'
  },
  {
    value: 'bug_Latn',
    label: 'Buginese'
  },
  {
    value: 'bul_Cyrl',
    label: 'Bulgarian (Cyrillic script)'
  },
  {
    value: 'cat_Latn',
    label: 'Catalan'
  },
  {
    value: 'ceb_Latn',
    label: 'Cebuano'
  },
  {
    value: 'cjk_Latn',
    label: 'Chokwe'
  },
  {
    value: 'ckb_Arab',
    label: 'Central Kurdish (Arabic script)'
  },
  {
    value: 'crh_Latn',
    label: 'Crimean Tatar (Latin script)'
  },
  {
    value: 'cym_Latn',
    label: 'Welsh'
  },
  {
    value: 'dan_Latn',
    label: 'Danish'
  },
  {
    value: 'deu_Latn',
    label: 'German'
  },
  {
    value: 'dik_Latn',
    label: 'Dinka'
  },
  {
    value: 'dyu_Latn',
    label: 'Dyula'
  },
  {
    value: 'dzo_Tibt',
    label: 'Dzongkha (Tibetan script)'
  },
  {
    value: 'eng_Latn',
    label: 'English'
  },
  {
    value: 'epo_Latn',
    label: 'Esperanto'
  },
  {
    value: 'est_Latn',
    label: 'Estonian'
  },
  {
    value: 'ewe_Latn',
    label: 'Ewe'
  },
  {
    value: 'fao_Latn',
    label: 'Faroese'
  },
  {
    value: 'fij_Latn',
    label: 'Fijian'
  },
  {
    value: 'fin_Latn',
    label: 'Finnish'
  },
  {
    value: 'fon_Latn',
    label: 'Fon'
  },
  {
    value: 'fra_Latn',
    label: 'French'
  },
  {
    value: 'fur_Latn',
    label: 'Friulian'
  },
  {
    value: 'fuv_Latn',
    label: 'Nigerian Fulfulde'
  },
  {
    value: 'gaz_Latn',
    label: 'West Central Oromo'
  },
  {
    value: 'gla_Latn',
    label: 'Scottish Gaelic'
  },
  {
    value: 'gle_Latn',
    label: 'Irish'
  },
  {
    value: 'glg_Latn',
    label: 'Galician'
  },
  {
    value: 'grn_Latn',
    label: 'Guarani'
  },
  {
    value: 'guj_Gujr',
    label: 'Gujarati'
  },
  {
    value: 'hat_Latn',
    label: 'Haitian Creole'
  },
  {
    value: 'hau_Latn',
    label: 'Hausa'
  },
  {
    value: 'heb_Hebr',
    label: 'Hebrew'
  },
  {
    value: 'hin_Deva',
    label: 'Hindi (Devanagari script)'
  },
  {
    value: 'hne_Deva',
    label: 'Chhattisgarhi (Devanagari script)'
  },
  {
    value: 'hrv_Latn',
    label: 'Croatian'
  },
  {
    value: 'hun_Latn',
    label: 'Hungarian'
  },
  {
    value: 'hye_Armn',
    label: 'Armenian'
  },
  {
    value: 'ibo_Latn',
    label: 'Igbo'
  },
  {
    value: 'ilo_Latn',
    label: 'Ilocano'
  },
  {
    value: 'ind_Latn',
    label: 'Indonesian'
  },
  {
    value: 'isl_Latn',
    label: 'Icelandic'
  },
  {
    value: 'ita_Latn',
    label: 'Italian'
  },
  {
    value: 'jav_Latn',
    label: 'Javanese'
  },
  {
    value: 'jpn_Jpan',
    label: 'Japanese (Japanese script)'
  },
  {
    value: 'kab_Latn',
    label: 'Kabyle'
  },
  {
    value: 'kac_Latn',
    label: 'Jingpho'
  },
  {
    value: 'kam_Latn',
    label: 'Kamba'
  },
  {
    value: 'kan_Knda',
    label: 'Kannada'
  },
  {
    value: 'kas_Arab',
    label: 'Kashmiri (Arabic script)'
  },
  {
    value: 'kas_Deva',
    label: 'Kashmiri (Devanagari script)'
  },
  {
    value: 'kat_Geor',
    label: 'Georgian'
  },
  {
    value: 'knc_Arab',
    label: 'Central Kanuri (Arabic script)'
  },
  {
    value: 'knc_Latn',
    label: 'Central Kanuri (Latin script)'
  },
  {
    value: 'kon_Latn',
    label: 'Kongo'
  },
  {
    value: 'kor_Hang',
    label: 'Korean (Hangul script)'
  },
  {
    value: 'lao_Laoo',
    label: 'Lao'
  },
  {
    value: 'lij_Latn',
    label: 'Ligurian'
  },
  {
    value: 'lim_Latn',
    label: 'Limburgish'
  },
  {
    value: 'lin_Latn',
    label: 'Lingala'
  },
  {
    value: 'lit_Latn',
    label: 'Lithuanian'
  },
  {
    value: 'ltg_Latn',
    label: 'Latgalian'
  },
  {
    value: 'ltz_Latn',
    label: 'Luxembourgish'
  },
  {
    value: 'lua_Latn',
    label: 'Luba-Kasai'
  },
  {
    value: 'lug_Latn',
    label: 'Ganda'
  },
  {
    value: 'luo_Latn',
    label: 'Luo'
  },
  {
    value: 'lus_Latn',
    label: 'Mizo'
  },
  {
    value: 'mag_Deva',
    label: 'Magahi (Devanagari script)'
  },
  {
    value: 'mai_Deva',
    label: 'Maithili (Devanagari script)'
  },
  {
    value: 'mal_Mlym',
    label: 'Malayalam'
  },
  {
    value: 'mar_Deva',
    label: 'Marathi (Devanagari script)'
  },
  {
    value: 'min_Latn',
    label: 'Minangkabau'
  },
  {
    value: 'mkd_Cyrl',
    label: 'Macedonian (Cyrillic script)'
  },
  {
    value: 'mlg_Latn',
    label: 'Malagasy'
  },
  {
    value: 'mlt_Latn',
    label: 'Maltese'
  },
  {
    value: 'mni_Beng',
    label: 'Manipuri (Bengali script)'
  },
  {
    value: 'mos_Latn',
    label: 'Mossi'
  },
  {
    value: 'mri_Latn',
    label: 'Maori'
  },
  {
    value: 'mya_Mymr',
    label: 'Burmese (Myanmar script)'
  },
  {
    value: 'nld_Latn',
    label: 'Dutch'
  },
  {
    value: 'nno_Latn',
    label: 'Norwegian Nynorsk'
  },
  {
    value: 'nob_Latn',
    label: 'Norwegian Bokmål'
  },
  {
    value: 'npi_Deva',
    label: 'Nepali (Devanagari script)'
  },
  {
    value: 'nso_Latn',
    label: 'Northern Sotho'
  },
  {
    value: 'nus_Latn',
    label: 'Nuer'
  },
  {
    value: 'nya_Latn',
    label: 'Chichewa'
  },
  {
    value: 'oci_Latn',
    label: 'Occitan'
  },
  {
    value: 'ory_Orya',
    label: 'Odia'
  },
  {
    value: 'pag_Latn',
    label: 'Pangasinan'
  },
  {
    value: 'pan_Guru',
    label: 'Punjabi (Gurmukhi script)'
  },
  {
    value: 'pap_Latn',
    label: 'Papiamento'
  },
  {
    value: 'pbt_Arab',
    label: 'Southern Pashto (Arabic script)'
  },
  {
    value: 'plt_Latn',
    label: 'Plateau Malagasy'
  },
  {
    value: 'pol_Latn',
    label: 'Polish'
  },
  {
    value: 'por_Latn',
    label: 'Portuguese'
  },
  {
    value: 'prs_Arab',
    label: 'Dari (Arabic script)'
  },
  {
    value: 'pus_Arab',
    label: 'Northern Pashto (Arabic script)'
  },
  {
    value: 'que_Latn',
    label: 'Quechua'
  },
  {
    value: 'ron_Latn',
    label: 'Romanian'
  },
  {
    value: 'run_Latn',
    label: 'Rundi'
  },
  {
    value: 'rus_Cyrl',
    label: 'Russian (Cyrillic script)'
  },
  {
    value: 'sag_Latn',
    label: 'Sango'
  },
  {
    value: 'san_Deva',
    label: 'Sanskrit (Devanagari script)'
  },
  {
    value: 'sat_Beng',
    label: 'Santali (Bengali script)'
  },
  {
    value: 'scn_Latn',
    label: 'Sicilian'
  },
  {
    value: 'shn_Mymr',
    label: 'Shan (Myanmar script)'
  },
  {
    value: 'sin_Sinh',
    label: 'Sinhala'
  },
  {
    value: 'slk_Latn',
    label: 'Slovak'
  },
  {
    value: 'slv_Latn',
    label: 'Slovenian'
  },
  {
    value: 'smo_Latn',
    label: 'Samoan'
  },
  {
    value: 'sna_Latn',
    label: 'Shona'
  },
  {
    value: 'snd_Arab',
    label: 'Sindhi (Arabic script)'
  },
  {
    value: 'som_Latn',
    label: 'Somali'
  },
  {
    value: 'sot_Latn',
    label: 'Southern Sotho'
  },
  {
    value: 'spa_Latn',
    label: 'Spanish'
  },
  {
    value: 'srd_Latn',
    label: 'Sardinian'
  },
  {
    value: 'srp_Cyrl',
    label: 'Serbian (Cyrillic script)'
  },
  {
    value: 'ssw_Latn',
    label: 'Swati'
  },
  {
    value: 'sun_Latn',
    label: 'Sundanese'
  },
  {
    value: 'swe_Latn',
    label: 'Swedish'
  },
  {
    value: 'swh_Latn',
    label: 'Swahili'
  },
  {
    value: 'szl_Latn',
    label: 'Silesian'
  },
  {
    value: 'tam_Taml',
    label: 'Tamil'
  },
  {
    value: 'tat_Cyrl',
    label: 'Tatar (Cyrillic script)'
  },
  {
    value: 'tel_Telu',
    label: 'Telugu'
  },
  {
    value: 'tgk_Cyrl',
    label: 'Tajik (Cyrillic script)'
  },
  {
    value: 'tgl_Latn',
    label: 'Tagalog'
  },
  {
    value: 'tha_Thai',
    label: 'Thai'
  },
  {
    value: 'tir_Ethi',
    label: 'Tigrinya (Ethiopic script)'
  },
  {
    value: 'tpi_Latn',
    label: 'Tok Pisin'
  },
  {
    value: 'tsn_Latn',
    label: 'Tswana'
  },
  {
    value: 'tso_Latn',
    label: 'Tsonga'
  },
  {
    value: 'tuk_Latn',
    label: 'Turkmen'
  },
  {
    value: 'tum_Latn',
    label: 'Tumbuka'
  },
  {
    value: 'tur_Latn',
    label: 'Turkish'
  },
  {
    value: 'twi_Latn',
    label: 'Twi'
  },
  {
    value: 'tzm_Latn',
    label: 'Central Atlas Tamazight (Latin script)'
  },
  {
    value: 'uig_Arab',
    label: 'Uyghur (Arabic script)'
  },
  {
    value: 'ukr_Cyrl',
    label: 'Ukrainian (Cyrillic script)'
  },
  {
    value: 'umb_Latn',
    label: 'Umbundu'
  },
  {
    value: 'urd_Arab',
    label: 'Urdu (Arabic script)'
  },
  {
    value: 'uzn_Latn',
    label: 'Northern Uzbek (Latin script)'
  },
  {
    value: 'vec_Latn',
    label: 'Venetian'
  },
  {
    value: 'vie_Latn',
    label: 'Vietnamese'
  },
  {
    value: 'war_Latn',
    label: 'Waray'
  },
  {
    value: 'wol_Latn',
    label: 'Wolof'
  },
  {
    value: 'xho_Latn',
    label: 'Xhosa'
  },
  {
    value: 'ydd_Hebr',
    label: 'Eastern Yiddish (Hebrew script)'
  },
  {
    value: 'yor_Latn',
    label: 'Yoruba'
  },
  {
    value: 'yue_Hant',
    label: 'Cantonese (Traditional Chinese script)'
  },
  {
    value: 'zho_Hans',
    label: 'Mandarin (Simplified Chinese script)'
  },
  {
    value: 'zho_Hant',
    label: 'Mandarin (Traditional Chinese script)'
  },
  {
    value: 'zul_Latn',
    label: 'Zulu'
  }
]

export function SelectLanguage({ onChange }: { onChange?: (language: string) => void }) {

  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='justify-between'
        >
          {value
            ? languageOptions.find(
                languageOption => languageOption.label === value
              )?.label
            : 'Select Language...'}
          <ChevronsUpDown className='opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0'>
        <Command>
          <CommandInput placeholder='Search framework...' className='h-9' />
          <CommandList>
            <CommandEmpty>Loading...</CommandEmpty>
            <CommandGroup>
              {languageOptions.map(languageOption => (
                <CommandItem
                  key={languageOption.value}
                  value={languageOption.label}
                  onSelect={currentLabel => {
                    setValue(currentLabel === value ? '' : currentLabel)
                    setOpen(false)
                    onChange?.(languageOption.value)
                  }}
                >
                  {languageOption.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === languageOption.value
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
