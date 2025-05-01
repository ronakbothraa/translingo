import os
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from pydub import AudioSegment


voice_clone_model_list = {
    'spanish_galleg': 'jpgallegoar/F5-Spanish',
    'thai_viz': 'VIZINTZOR/F5-TTS-THAI',
    'russian_hotstone': 'hotstone228/F5-TTS-Russian',
    'portuguese_br_fp': 'firstpixel/F5-TTS-pt-br',
    'erax_unixsex': 'erax-ai/EraX-Smile-UnixSex-F5',
    'hungarian_sarpba': 'sarpba/F5-TTS-Hun',
    'hungarian_mp3': 'mp3pintyo/F5-TTS-Hun',
    'greek_petros': 'PetrosStav/F5-TTS-Greek',
    'french_rasp': 'RASPIAUDIO/F5-French-MixedSpeakers-reduced',
    'turkish_marduk': 'marduk-ra/F5-TTS-Turkish',
    'indonesian_eempostor': 'Eempostor/F5-TTS-IND-FINETUNE',
    'german_aihpi': 'aihpi/F5-TTS-German',
    'finnish_asmo': 'AsmoKoskinen/F5-TTS_Finnish_Model',
    'italian_alien': 'alien79/F5-TTS-italian',
    'norwegian_akhbar': 'akhbar/F5_Norwegian',
    'vietnamese_yuki': 'yukiakai/F5-TTS-Vietnamese',
    'english_ljspeech': 'sinhprous/F5TTS-stabilized-LJSpeech',
    'norwegian_syntax': 'SyntaxBreakers/Norsk_TTS',
    'erax_female': 'erax-ai/EraX-Smile-Female-F5-V1.0',
    'malaysian_meso_v3': 'mesolitica/Malaysian-F5-TTS-v3',
    'vietnamese_zalo': 'zalopay/vietnamese-tts', # Note: Might not be strictly F5 but listed
    'portuguese_br_tharyck': 'Tharyck/multispeaker-ptbr-f5tts',
    'multi_eng_ger_pol': 'Gregniuki/F5-tts_English_German_Polish',
    'indonesian_anantoj': 'anantoj/f5-id-v1',
    'italian_alien_test': 'alien79/f5-ita-test',
    'thai_muscari': 'Muscari/F5-TTS-TH_Finetuned',
    'english_fairytale': 'benjamin-paine/fairytaler', # Assuming English based on name
    'spanish_juanfa_mlx': 'Juanfa/F5-Spanish-MLX-Compat', # Note: MLX might require different handling
    'malaysian_meso_v1': 'mesolitica/Malaysian-F5-TTS',
    'hindi_futurix': 'Futurix-AI/Hindi-TTS',
    'malaysian_meso_v2': 'mesolitica/Malaysian-F5-TTS-v2',
    'hakka_formospeech': 'formospeech/f5-tts-hakka-finetune',
    'ami_xiuguluan': 'united-link/f5-tts-ami-xiuguluan-finetune',
    'arabic_ibrahim': 'IbrahimSalah/F5-TTS-Arabic',
    'ami_finetune': 'united-link/f5-tts-ami-finetune',
    'ami_ithuan_trv': 'united-link/f5-tts-ami-finetune-with-ithuan-trv',
    'hungarian_sarpba_v1': 'sarpba/F5-TTS_V1_hun',
    'gujarati_harsh': 'HarshBhanushali7705/TTS_for_gujarati_language',
    'russian_tvi_accent': 'TVI/f5-tts-ru-accent',
    'slovak_peter': 'petercheben/F5_TTS_Slovak',
    # Add any other models here if missed
}


class SpeechToTranslate:
    def __init__(self, input_lang, output_lang):
        self.input_lang = input_lang
        self.output_lang = output_lang
        self.translated_text = ""

        self.translation_tokenizer = AutoTokenizer.from_pretrained("facebook/nllb-200-distilled-600M")
        self.translation_model = AutoModelForSeq2SeqLM.from_pretrained("facebook/nllb-200-distilled-600M")

        self.output_languages = {"ace_Arab": "Achinese (Arabic script)", "ace_Latn": "Achinese (Latin script)", "acm_Arab": "Iraqi Arabic (Arabic script)", "acq_Arab": "Ta'izzi-Adeni Arabic (Arabic script)", "aeb_Arab": "Tunisian Arabic (Arabic script)", "afr_Latn": "Afrikaans", "ajp_Arab": "South Levantine Arabic (Arabic script)", "aka_Latn": "Akan", "amh_Ethi": "Amharic", "apc_Arab": "North Levantine Arabic (Arabic script)", "arb_Arab": "Standard Arabic (Arabic script)", "ars_Arab": "Najdi Arabic (Arabic script)", "ary_Arab": "Moroccan Arabic (Arabic script)", "arz_Arab": "Egyptian Arabic (Arabic script)", "ast_Latn": "Asturian", "awa_Deva": "Awadhi (Devanagari script)", "ayr_Latn": "Aymara", "azb_Arab": "South Azerbaijani (Arabic script)", "azj_Latn": "North Azerbaijani (Latin script)", "bak_Cyrl": "Bashkir (Cyrillic script)", "bam_Latn": "Bambara", "ban_Latn": "Balinese", "bel_Cyrl": "Belarusian (Cyrillic script)", "bem_Latn": "Bemba", "ben_Beng": "Bengali", "bho_Deva": "Bhojpuri (Devanagari script)", "bjn_Arab": "Banjar (Arabic script)", "bjn_Latn": "Banjar (Latin script)", "bod_Tibt": "Tibetan", "bos_Latn": "Bosnian (Latin script)", "bug_Latn": "Buginese", "bul_Cyrl": "Bulgarian (Cyrillic script)", "cat_Latn": "Catalan", "ceb_Latn": "Cebuano", "cjk_Latn": "Chokwe", "ckb_Arab": "Central Kurdish (Arabic script)", "crh_Latn": "Crimean Tatar (Latin script)", "cym_Latn": "Welsh", "dan_Latn": "Danish", "deu_Latn": "German", "dik_Latn": "Dinka", "dyu_Latn": "Dyula", "dzo_Tibt": "Dzongkha (Tibetan script)", "eng_Latn": "English", "epo_Latn": "Esperanto", "est_Latn": "Estonian", "ewe_Latn": "Ewe", "fao_Latn": "Faroese", "fij_Latn": "Fijian", "fin_Latn": "Finnish", "fon_Latn": "Fon", "fra_Latn": "French", "fur_Latn": "Friulian", "fuv_Latn": "Nigerian Fulfulde", "gaz_Latn": "West Central Oromo", "gla_Latn": "Scottish Gaelic", "gle_Latn": "Irish", "glg_Latn": "Galician", "grn_Latn": "Guarani", "guj_Gujr": "Gujarati", "hat_Latn": "Haitian Creole", "hau_Latn": "Hausa", "heb_Hebr": "Hebrew", "hin_Deva": "Hindi (Devanagari script)", "hne_Deva": "Chhattisgarhi (Devanagari script)", "hrv_Latn": "Croatian", "hun_Latn": "Hungarian", "hye_Armn": "Armenian", "ibo_Latn": "Igbo", "ilo_Latn": "Ilocano", "ind_Latn": "Indonesian", "isl_Latn": "Icelandic", "ita_Latn": "Italian", "jav_Latn": "Javanese", "jpn_Jpan": "Japanese (Japanese script)", "kab_Latn": "Kabyle", "kac_Latn": "Jingpho", "kam_Latn": "Kamba", "kan_Knda": "Kannada", "kas_Arab": "Kashmiri (Arabic script)", "kas_Deva": "Kashmiri (Devanagari script)", "kat_Geor": "Georgian", "knc_Arab": "Central Kanuri (Arabic script)", "knc_Latn": "Central Kanuri (Latin script)", "kon_Latn": "Kongo", "kor_Hang": "Korean (Hangul script)", "lao_Laoo": "Lao", "lij_Latn": "Ligurian", "lim_Latn": "Limburgish", "lin_Latn": "Lingala", "lit_Latn": "Lithuanian", "ltg_Latn": "Latgalian", "ltz_Latn": "Luxembourgish", "lua_Latn": "Luba-Kasai", "lug_Latn": "Ganda", "luo_Latn": "Luo", "lus_Latn": "Mizo", "mag_Deva": "Magahi (Devanagari script)", "mai_Deva": "Maithili (Devanagari script)", "mal_Mlym": "Malayalam", "mar_Deva": "Marathi (Devanagari script)", "min_Latn": "Minangkabau", "mkd_Cyrl": "Macedonian (Cyrillic script)", "mlg_Latn": "Malagasy", "mlt_Latn": "Maltese", "mni_Beng": "Manipuri (Bengali script)", "mos_Latn": "Mossi", "mri_Latn": "Maori", "mya_Mymr": "Burmese (Myanmar script)", "nld_Latn": "Dutch", "nno_Latn": "Norwegian Nynorsk", "nob_Latn": "Norwegian Bokmål", "npi_Deva": "Nepali (Devanagari script)", "nso_Latn": "Northern Sotho", "nus_Latn": "Nuer", "nya_Latn": "Chichewa", "oci_Latn": "Occitan", "ory_Orya": "Odia", "pag_Latn": "Pangasinan", "pan_Guru": "Punjabi (Gurmukhi script)", "pap_Latn": "Papiamento", "pbt_Arab": "Southern Pashto (Arabic script)", "plt_Latn": "Plateau Malagasy", "pol_Latn": "Polish", "por_Latn": "Portuguese", "prs_Arab": "Dari (Arabic script)", "pus_Arab": "Northern Pashto (Arabic script)", "que_Latn": "Quechua", "ron_Latn": "Romanian", "run_Latn": "Rundi", "rus_Cyrl": "Russian (Cyrillic script)", "sag_Latn": "Sango", "san_Deva": "Sanskrit (Devanagari script)", "sat_Beng": "Santali (Bengali script)", "scn_Latn": "Sicilian", "shn_Mymr": "Shan (Myanmar script)", "sin_Sinh": "Sinhala", "slk_Latn": "Slovak", "slv_Latn": "Slovenian", "smo_Latn": "Samoan", "sna_Latn": "Shona", "snd_Arab": "Sindhi (Arabic script)", "som_Latn": "Somali", "sot_Latn": "Southern Sotho", "spa_Latn": "Spanish", "srd_Latn": "Sardinian", "srp_Cyrl": "Serbian (Cyrillic script)", "ssw_Latn": "Swati", "sun_Latn": "Sundanese", "swe_Latn": "Swedish", "swh_Latn": "Swahili", "szl_Latn": "Silesian", "tam_Taml": "Tamil", "tat_Cyrl": "Tatar (Cyrillic script)", "tel_Telu": "Telugu", "tgk_Cyrl": "Tajik (Cyrillic script)", "tgl_Latn": "Tagalog", "tha_Thai": "Thai", "tir_Ethi": "Tigrinya (Ethiopic script)", "tpi_Latn": "Tok Pisin", "tsn_Latn": "Tswana", "tso_Latn": "Tsonga", "tuk_Latn": "Turkmen", "tum_Latn": "Tumbuka", "tur_Latn": "Turkish", "twi_Latn": "Twi", "tzm_Latn": "Central Atlas Tamazight (Latin script)", "uig_Arab": "Uyghur (Arabic script)", "ukr_Cyrl": "Ukrainian (Cyrillic script)", "umb_Latn": "Umbundu", "urd_Arab": "Urdu (Arabic script)", "uzn_Latn": "Northern Uzbek (Latin script)", "vec_Latn": "Venetian", "vie_Latn": "Vietnamese", "war_Latn": "Waray", "wol_Latn": "Wolof", "xho_Latn": "Xhosa", "ydd_Hebr": "Eastern Yiddish (Hebrew script)", "yor_Latn": "Yoruba", "yue_Hant": "Cantonese (Traditional Chinese script)", "zho_Hans": "Mandarin (Simplified Chinese script)", "zho_Hant": "Mandarin (Traditional Chinese script)", "zul_Latn": "Zulu"}
        # self.input_languages = { "am": "Amharic", "ar": "Arabic", "as": "Assamese", "az": "Azerbaijani", "af": "Afrikaans", "ba": "Bashkir", "be": "Belarusian", "bg": "Bulgarian", "bn": "Bengali", "bo": "Tibetan", "br": "Breton", "bs": "Bosnian", "ca": "Catalan", "cs": "Czech", "cy": "Welsh", "da": "Danish", "de": "German", "el": "Greek", "en": "English", "es": "Spanish", "et": "Estonian", "eu": "Basque", "fa": "Persian", "fi": "Finnish", "fo": "Faroese", "fr": "French", "gl": "Galician", "gu": "Gujarati", "ha": "Hausa", "haw": "Hawaiian", "he": "Hebrew", "hi": "Hindi", "hr": "Croatian", "ht": "Haitian Creole", "hu": "Hungarian", "hy": "Armenian", "id": "Indonesian", "is": "Icelandic", "it": "Italian", "ja": "Japanese", "jw": "Javanese", "ka": "Georgian", "kk": "Kazakh", "km": "Khmer", "kn": "Kannada", "ko": "Korean", "la": "Latin", "lb": "Luxembourgish", "ln": "Lingala", "lo": "Lao", "lt": "Lithuanian", "lv": "Latvian", "mg": "Malagasy", "mi": "Maori", "mk": "Macedonian", "ml": "Malayalam", "mn": "Mongolian", "mr": "Marathi", "ms": "Malay", "mt": "Maltese", "my": "Burmese", "ne": "Nepali", "nl": "Dutch", "nn": "Norwegian Nynorsk", "no": "Norwegian", "oc": "Occitan", "pa": "Punjabi", "pl": "Polish", "ps": "Pashto", "pt": "Portuguese", "ro": "Romanian", "ru": "Russian", "sa": "Sanskrit", "sd": "Sindhi", "si": "Sinhala", "sk": "Slovak", "sl": "Slovenian", "sn": "Shona", "so": "Somali", "sq": "Albanian", "sr": "Serbian", "su": "Sundanese", "sv": "Swedish", "sw": "Swahili", "ta": "Tamil", "te": "Telugu", "tg": "Tajik", "th": "Thai", "tk": "Turkmen", "tl": "Tagalog", "tr": "Turkish", "tt": "Tatar", "uk": "Ukrainian", "ur": "Urdu", "uz": "Uzbek", "vi": "Vietnamese", "yi": "Yiddish", "yo": "Yoruba", "zh": "Mandarin Chinese", "yue": "Cantonese"}

    def translate(self, transcript=""):
        inputs = self.translation_tokenizer(transcript, return_tensors="pt", padding=True, truncation=True).to("cuda")
        inputs = {k: inputs[k].to(self.translation_model.device) for k in inputs}
        outputs = self.translation_model.generate(**inputs, forced_bos_token_id=self.translation_tokenizer.convert_tokens_to_ids(self.output_lang))
        outputs = self.translation_tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
        self.translated_text = outputs
        return outputs

