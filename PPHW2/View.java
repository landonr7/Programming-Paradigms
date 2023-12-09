import javax.swing.JPanel;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.File;
import javax.swing.JButton;
import java.awt.Color;
import java.util.ArrayList;

class View extends JPanel
{
	JButton b1, b2, b3;
	ArrayList<BufferedImage> images = new ArrayList<BufferedImage>();
	BufferedImage curr_image = null;

	int x_scroll = 0;
	int y_scroll = 0;
	static int count;

	Model model;

	View(Controller c, Model m)
	{
		// Make a save button
		b1 = new JButton("Save");
		b1.addActionListener(c);
		this.add(b1);

		// Make a button
		b2 = new JButton("Load");
		b2.addActionListener(c);
		this.add(b2);

		// Make a button
		b3 = new JButton("Clear");
		b3.addActionListener(c);
		this.add(b3);

		// Link up to other objects
		c.setView(this);
		model = m;

		// Send mouse events to the controller
		this.addMouseListener(c);
		this.addMouseMotionListener(c);

		this.addKeyListener(c);

		// Loads each image into array
		for (int i = 0; i < Game.Things.length; i++)
		{
			try
			{
				images.add(ImageIO.read(new File("images/"+Game.Things[i]+".png")));

			} catch(Exception e) {
				e.printStackTrace(System.err);
				System.exit(1);
			}
		}

	curr_image = images.get(0);

	}

	public void paintComponent(Graphics g)
	{

		count++;
		// Clear the background
		g.setColor(new Color(128, 255, 50));
		g.fillRect(0, 0, this.getWidth(), this.getHeight());

		// Draw purple box
		g.setColor(new Color(230, 100, 250));
		g.fillRect(0, 0, 200, 200);
		

		//Draw the image so that its bottom center is at (x,y)
		int w = this.curr_image.getWidth();
		int h = this.curr_image.getHeight();
		g.drawImage(this.curr_image, model.curr_x - w / 2, model.curr_y - h, null);

		for(int i = 0; i < model.things.size(); i++)
		{
			g.drawImage(images.get(model.things.get(i).kind), (model.things.get(i).getPosition().x) - x_scroll, (model.things.get(i).getPosition().y) - y_scroll, null);

		}

	}
	
}
