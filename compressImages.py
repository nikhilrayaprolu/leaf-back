#!/usr/bin/python

from PIL import Image
import os, sys

source_path = "uploads/"
destination_path = "final_uploads/"

source_dir = os.listdir("uploads/")
new_width = 300;

def compress_images():
	for img in source_dir:
			img_path = os.path.join(source_path + img)
			if os.path.isfile(img_path):
				newimg_path = os.path.join(destination_path + img)
				try:
					image = Image.open(img_path)
					new_height = int(new_width * float(image.size[1])/float(image.size[0]))
					image = image.resize((new_width, new_height), Image.ANTIALIAS)
					image = image.convert('RGB')
					image.save(newimg_path, 'JPEG', quality = 60)
					os.remove(img_path)
				except IOError:
					continue
compress_images()

