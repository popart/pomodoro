FROM pritunl/archlinux

RUN pacman -S --noconfirm python3
RUN pacman -S --noconfirm python-pip
RUN pacman -S --noconfirm npm
RUN pacman -S --noconfirm sqlite3
RUN pacman -S --noconfirm vim

RUN pip install flask

EXPOSE 5000
