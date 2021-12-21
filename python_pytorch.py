import base64
import io
import json
import os
import gdown
#import fastbook
#fastbook.setup_book()
import fastai
import pandas as pd
import requests
import torchtext
import nltk
import snscrape.modules.twitter as sntwitter
from copy import deepcopy

from torchvision import models
from torchvision import transforms
from PIL import Image
from django.shortcuts import render
from django.conf import settings
#from fastbook import *
from torchtext.data import get_tokenizer
from fastai.text.all import *

nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
from nltk.corpus import wordnet
from nltk import FreqDist
from string import punctuation
import mmap

from .run_prediction_models import RunPredictionModels

import pathlib
posixpath_temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

import sys

path_cwd = os.getcwd()
path_df = 'pytorch_assets\\dataframes'
path_dls = 'pytorch_assets\\dataloaders'
path_models = 'pytorch_assets\\models'







# print(sys.argv[2] + ' was fed to me')

try:
    r = RunPredictionModels()
    r.initialize_assets()
except Exception as e:
    print(e)